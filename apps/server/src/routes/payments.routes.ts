import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "../db/client.js";
import { plans, subscriptions, referrals } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { razorpay, isRazorpayConfigured, verifyPaymentSignature, verifyWebhookSignature } from "../lib/razorpay.js";
import { cashfree, isCashfreeConfigured, verifyCashfreeWebhookSignature } from "../lib/cashfree.js";
import { priceFor, type BillingCycle } from "../lib/pricing.js";
import { tierForPaidConversions, commissionPctForTier } from "../lib/referral.js";

export const paymentsRouter = Router();

// The frontend uses this to decide which checkout SDK to load and which
// create-order/verify endpoints to call. Cashfree is preferred when both are
// configured — Razorpay live payments are blocked pending SEBI registration
// (see the /webhook handler below), so once Cashfree sandbox/live keys are
// set, it becomes the active gateway while the Razorpay code stays in place.
paymentsRouter.get("/status", (_req, res) => {
  const razorpayOk = isRazorpayConfigured();
  const cashfreeOk = isCashfreeConfigured();
  res.json({
    configured: razorpayOk || cashfreeOk,
    provider: cashfreeOk ? "CASHFREE" : razorpayOk ? "RAZORPAY" : null,
    razorpay: razorpayOk,
    cashfree: cashfreeOk,
    cashfreeMode: process.env.CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
  });
});

// The caller's currently active (not expired) subscriptions, most recent
// first, with plan details joined in — powers the "Your plan" card on the
// dashboard so it reflects what the user actually bought instead of always
// showing "no subscription."
paymentsRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  const now = new Date();
  const rows = await db
    .select({
      id: subscriptions.id,
      planId: subscriptions.planId,
      billingCycle: subscriptions.billingCycle,
      status: subscriptions.status,
      amount: subscriptions.amount,
      startedAt: subscriptions.startedAt,
      expiresAt: subscriptions.expiresAt,
      canceledAt: subscriptions.canceledAt,
      plan: { name: plans.name, market: plans.market, tier: plans.tier },
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.userId, req.user!.sub),
        eq(subscriptions.status, "ACTIVE"),
        or(isNull(subscriptions.expiresAt), gt(subscriptions.expiresAt, now))
      )
    )
    .orderBy(desc(subscriptions.startedAt));

  res.json({ subscriptions: rows });
});

const cancelSchema = z.object({ subscriptionId: z.string() });

// "Cancel" just stops it from being considered for renewal — status stays
// ACTIVE and entitlements are untouched, so the user keeps what they already
// paid for until expiresAt. There's no auto-renewal/recurring billing wired
// up yet (see the webhook TODO below), so in practice this mainly exists to
// let the user record "don't charge me again" and see that reflected in the UI.
paymentsRouter.post("/cancel", requireAuth, async (req: Request, res: Response) => {
  const parsed = cancelSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, parsed.data.subscriptionId),
  });
  if (!subscription) return res.status(404).json({ error: "Subscription not found" });
  if (subscription.userId !== req.user!.sub) {
    return res.status(403).json({ error: "This subscription doesn't belong to you" });
  }
  if (subscription.status !== "ACTIVE") {
    return res.status(400).json({ error: "Only active subscriptions can be canceled" });
  }

  const [updated] = await db
    .update(subscriptions)
    .set({ canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(subscriptions.id, subscription.id))
    .returning();

  res.json({ subscription: updated });
});

const createOrderSchema = z.object({
  planId: z.string(),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
});

// Creates a Razorpay order for the given plan + billing cycle, and a PENDING
// subscription row to reconcile once the client confirms payment.
// Requires RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in apps/server/.env — until the
// client provides real (test or live) keys from their Razorpay dashboard, this
// returns 501 so the rest of the app keeps working.
paymentsRouter.post("/create-order", requireAuth, async (req: Request, res: Response) => {
  if (!razorpay) {
    return res.status(501).json({
      error: "Payments are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to apps/server/.env.",
    });
  }
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { planId, billingCycle } = parsed.data as { planId: string; billingCycle: BillingCycle };

  const plan = await db.query.plans.findFirst({ where: eq(plans.id, planId) });
  if (!plan) return res.status(404).json({ error: "Plan not found" });

  const { billedTotal } = priceFor(plan.basePriceMonthly, billingCycle);
  const amountPaise = billedTotal * 100;

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `sub_${Date.now()}`,
    notes: { planId: plan.id, billingCycle, userId: req.user!.sub },
  });

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      userId: req.user!.sub,
      planId: plan.id,
      billingCycle,
      status: "PENDING",
      razorpayOrderId: order.id,
      amount: billedTotal,
    })
    .returning();

  res.json({
    orderId: order.id,
    amount: amountPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    subscriptionId: subscription.id,
  });
});

const verifySchema = z.object({
  subscriptionId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

const MONTHS_BY_CYCLE: Record<BillingCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  ANNUAL: 12,
};

paymentsRouter.post("/verify", requireAuth, async (req: Request, res: Response) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { subscriptionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, subscriptionId),
  });
  if (!subscription) return res.status(404).json({ error: "Subscription not found" });
  // Must belong to the caller, and the paid order must be the exact order we
  // created for it — otherwise a validly-signed payment for one order could be
  // replayed to activate an unrelated (e.g. pricier) pending subscription.
  if (subscription.userId !== req.user!.sub) {
    return res.status(403).json({ error: "This subscription doesn't belong to you" });
  }
  if (subscription.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({ error: "Order does not match this subscription" });
  }

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) return res.status(400).json({ error: "Payment signature verification failed" });

  // Shared with the webhook below — whichever of the two notices the payment
  // first does the actual activation, the other is a no-op. This is the fast
  // path: it runs the instant the Checkout popup's callback fires, so the
  // user gets redirected to the dashboard immediately instead of waiting on
  // Razorpay's webhook delivery.
  const updated = await activateSubscriptionForOrder(razorpay_order_id, razorpay_payment_id);
  if (!updated) return res.status(404).json({ error: "Subscription not found" });

  res.json({ subscription: updated });
});

// --- Cashfree ---------------------------------------------------------
// Mirrors the Razorpay create-order/verify pair above. Added as an
// alternative gateway after Razorpay rejected fxcryptoedge.in's live-website
// verification, citing a missing SEBI Research Analyst/Investment Adviser
// licence — an industry-wide requirement for trading-signal businesses that
// Cashfree's own onboarding docs list too (Finance line-of-business ->
// SEBI/FEMA/PA-PG licence), so this may hit the same wall at live approval.
// Sandbox testing works immediately with Cashfree test keys regardless.
paymentsRouter.post("/create-order-cashfree", requireAuth, async (req: Request, res: Response) => {
  if (!cashfree) {
    return res.status(501).json({
      error: "Cashfree is not configured yet. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to apps/server/.env.",
    });
  }
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { planId, billingCycle } = parsed.data as { planId: string; billingCycle: BillingCycle };

  const plan = await db.query.plans.findFirst({ where: eq(plans.id, planId) });
  if (!plan) return res.status(404).json({ error: "Plan not found" });

  const { billedTotal } = priceFor(plan.basePriceMonthly, billingCycle);
  // Cashfree order_id must be unique, 3-45 chars, alphanumeric/_/- only.
  const orderId = `sub_${Date.now()}_${req.user!.sub.slice(0, 8)}`;
  const clientOrigin = (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(",")[0].trim();
  const apiOrigin = process.env.API_ORIGIN || `http://localhost:${process.env.PORT || 4000}`;

  try {
    const cfResponse = await cashfree.PGCreateOrder({
      order_id: orderId,
      order_amount: billedTotal,
      order_currency: "INR",
      customer_details: {
        customer_id: req.user!.sub,
        customer_email: req.user!.email,
        // Not collected at signup — Cashfree requires a 10-digit value on
        // every order regardless, so a placeholder is used until a real
        // phone field exists on the user profile.
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: `${clientOrigin}/dashboard?order_id={order_id}`,
        notify_url: `${apiOrigin}/api/payments/webhook-cashfree`,
      },
      order_note: `${plan.name} — ${billingCycle}`,
    });

    const order = cfResponse.data;
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId: req.user!.sub,
        planId: plan.id,
        billingCycle,
        status: "PENDING",
        provider: "CASHFREE",
        cashfreeOrderId: order.order_id,
        amount: billedTotal,
      })
      .returning();

    res.json({
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      subscriptionId: subscription.id,
    });
  } catch (err) {
    const detail = (err as { response?: { data?: unknown } })?.response?.data;
    console.error("[payments] Cashfree create-order failed:", detail ?? err);
    res.status(502).json({ error: "Could not create Cashfree order" });
  }
});

const verifyCashfreeSchema = z.object({
  subscriptionId: z.string(),
  orderId: z.string(),
});

// Cashfree's Checkout SDK only tells the browser that a payment attempt
// completed — not whether it actually succeeded — so unlike Razorpay there's
// no client-side signature to check here. The real status has to come from
// Cashfree's server via Get Order. This is the fast path (mirrors /verify);
// the /webhook-cashfree handler below is the reliable source of truth if the
// browser closes before this call fires.
paymentsRouter.post("/verify-cashfree", requireAuth, async (req: Request, res: Response) => {
  if (!cashfree) return res.status(501).json({ error: "Cashfree is not configured" });
  const parsed = verifyCashfreeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { subscriptionId, orderId } = parsed.data;

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, subscriptionId),
  });
  if (!subscription) return res.status(404).json({ error: "Subscription not found" });
  if (subscription.userId !== req.user!.sub) {
    return res.status(403).json({ error: "This subscription doesn't belong to you" });
  }
  if (subscription.cashfreeOrderId !== orderId) {
    return res.status(400).json({ error: "Order does not match this subscription" });
  }

  try {
    const cfResponse = await cashfree.PGFetchOrder(orderId);
    if (cfResponse.data.order_status !== "PAID") {
      return res.status(400).json({ error: `Payment not confirmed yet (status: ${cfResponse.data.order_status})` });
    }
  } catch (err) {
    console.error("[payments] Cashfree fetch-order failed:", (err as { response?: { data?: unknown } })?.response?.data ?? err);
    return res.status(502).json({ error: "Could not confirm payment with Cashfree" });
  }

  const updated = await activateCashfreeSubscriptionForOrder(orderId);
  if (!updated) return res.status(404).json({ error: "Subscription not found" });

  res.json({ subscription: updated });
});

// Marks a PENDING subscription as ACTIVE (sets startedAt/expiresAt) and
// credits any referral commission. Shared by both gateways' activation
// helpers below. Idempotent: if the subscription is already ACTIVE (because
// the client-side /verify call or a prior webhook delivery already handled
// it), this just returns it as-is without re-crediting the referral or
// overwriting startedAt/expiresAt.
async function activatePendingSubscription(
  subscription: typeof subscriptions.$inferSelect,
  extra: Partial<typeof subscriptions.$inferInsert>
) {
  if (subscription.status !== "PENDING") return subscription;

  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + MONTHS_BY_CYCLE[subscription.billingCycle as BillingCycle]);

  const [updated] = await db
    .update(subscriptions)
    .set({ status: "ACTIVE", startedAt: now, expiresAt: expires, updatedAt: now, ...extra })
    .where(eq(subscriptions.id, subscription.id))
    .returning();

  await creditReferralOnFirstConversion(updated.userId, updated.amount);
  return updated;
}

// Marks the PENDING subscription tied to a Razorpay order as ACTIVE.
async function activateSubscriptionForOrder(orderId: string, paymentId?: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.razorpayOrderId, orderId),
  });
  if (!subscription) return null;
  return activatePendingSubscription(subscription, {
    razorpayPaymentId: paymentId ?? subscription.razorpayPaymentId,
  });
}

// Marks the PENDING subscription tied to a Cashfree order as ACTIVE.
async function activateCashfreeSubscriptionForOrder(orderId: string, paymentId?: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.cashfreeOrderId, orderId),
  });
  if (!subscription) return null;
  return activatePendingSubscription(subscription, {
    cashfreePaymentId: paymentId ?? subscription.cashfreePaymentId,
  });
}

// If this user signed up via a referral code and this is their first ever
// paid subscription, mark that referral CONVERTED and credit the referrer's
// commission at their current tier rate. Only fires once per referred user
// (guarded by the SIGNED_UP -> CONVERTED status check), so later renewals or
// plan changes don't double-pay the referrer.
async function creditReferralOnFirstConversion(referredUserId: string, paymentAmount: number) {
  const referral = await db.query.referrals.findFirst({
    where: and(eq(referrals.referredUserId, referredUserId), eq(referrals.status, "SIGNED_UP")),
  });
  if (!referral) return;

  const priorConversions = await db.query.referrals.findMany({
    where: and(eq(referrals.referrerId, referral.referrerId), eq(referrals.status, "CONVERTED")),
  });
  const tier = tierForPaidConversions(priorConversions.length);
  const commissionPct = commissionPctForTier(tier.key);
  const commissionEarned = Math.round(paymentAmount * commissionPct);

  await db
    .update(referrals)
    .set({ status: "CONVERTED", commissionEarned, updatedAt: new Date() })
    .where(eq(referrals.id, referral.id));
}

// Razorpay server-to-server webhook. This is what makes payment activation
// reliable: the client-side /verify call above only fires if the customer's
// browser stays open through the Checkout popup's callback — if they close
// the tab, lose network, or the app crashes mid-callback, Razorpay still has
// their money but our database would never have found out. Razorpay retries
// this webhook independently of the browser, so it's the source of truth;
// /verify is just a fast path for immediate UI feedback. Configure this URL
// (https://<api-domain>/api/payments/webhook) and a webhook secret in the
// Razorpay dashboard under Settings → Webhooks, and set RAZORPAY_WEBHOOK_SECRET
// in Render to match.
paymentsRouter.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string | undefined;
  const rawBody = req.rawBody;
  if (!rawBody || !signature || !verifyWebhookSignature(rawBody, signature)) {
    console.warn(
      `[payments] webhook signature check failed (hasRawBody=${!!rawBody}, hasSignature=${!!signature}) — check RAZORPAY_WEBHOOK_SECRET matches the Razorpay dashboard`
    );
    return res.status(400).json({ error: "Invalid webhook signature" });
  }
  console.log(`[payments] webhook received: event=${req.body?.event}`);

  const event = req.body?.event as string | undefined;
  const paymentEntity = req.body?.payload?.payment?.entity as
    | { id?: string; order_id?: string }
    | undefined;

  // payment.captured is the reliable "money has actually landed" event.
  // order.paid fires alongside it for the same order — handled by the same
  // idempotent function, so it's harmless if both arrive.
  if ((event === "payment.captured" || event === "order.paid") && paymentEntity?.order_id) {
    try {
      await activateSubscriptionForOrder(paymentEntity.order_id, paymentEntity.id);
    } catch (err) {
      console.error("[payments] failed to activate subscription from webhook:", err);
      // Still ack with 200 below — returning an error here would make Razorpay
      // retry indefinitely for what might be a permanent bug, not a transient
      // one. The failure is logged for manual follow-up instead.
    }
  }

  res.json({ ok: true });
});

// Cashfree server-to-server webhook — same role as the Razorpay one above:
// the reliable source of truth in case the browser never gets to call
// /verify-cashfree. Configure this URL (https://<api-domain>/api/payments/webhook-cashfree)
// under Developers -> Webhooks in the Cashfree dashboard; the signing secret
// is the same CASHFREE_SECRET_KEY used to create orders (no separate webhook
// secret to configure).
paymentsRouter.post("/webhook-cashfree", async (req: Request, res: Response) => {
  const signature = req.headers["x-webhook-signature"] as string | undefined;
  const timestamp = req.headers["x-webhook-timestamp"] as string | undefined;
  const rawBody = req.rawBody;
  if (!rawBody || !signature || !timestamp || !verifyCashfreeWebhookSignature(rawBody, signature, timestamp)) {
    console.warn(
      `[payments] Cashfree webhook signature check failed (hasRawBody=${!!rawBody}, hasSignature=${!!signature}, hasTimestamp=${!!timestamp}) — check CASHFREE_SECRET_KEY matches the Cashfree dashboard`
    );
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const type = req.body?.type as string | undefined;
  console.log(`[payments] Cashfree webhook received: type=${type}`);
  const orderId = req.body?.data?.order?.order_id as string | undefined;
  const paymentId = req.body?.data?.payment?.cf_payment_id as string | undefined;
  const paymentStatus = req.body?.data?.payment?.payment_status as string | undefined;

  if (type === "PAYMENT_SUCCESS_WEBHOOK" && paymentStatus === "SUCCESS" && orderId) {
    try {
      await activateCashfreeSubscriptionForOrder(orderId, paymentId);
    } catch (err) {
      console.error("[payments] failed to activate subscription from Cashfree webhook:", err);
      // Still ack with 200 below — same reasoning as the Razorpay webhook:
      // don't make Cashfree retry indefinitely for a permanent bug.
    }
  }

  res.json({ ok: true });
});
