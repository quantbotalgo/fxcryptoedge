import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { plans, subscriptions, referrals } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { razorpay, isRazorpayConfigured, verifyPaymentSignature, verifyWebhookSignature } from "../lib/razorpay.js";
import { priceFor, type BillingCycle } from "../lib/pricing.js";
import { tierForPaidConversions, commissionPctForTier } from "../lib/referral.js";

export const paymentsRouter = Router();

paymentsRouter.get("/status", (_req, res) => {
  res.json({ configured: isRazorpayConfigured() });
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

  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + MONTHS_BY_CYCLE[subscription.billingCycle as BillingCycle]);

  const [updated] = await db
    .update(subscriptions)
    .set({
      status: "ACTIVE",
      razorpayPaymentId: razorpay_payment_id,
      startedAt: now,
      expiresAt: expires,
      updatedAt: now,
    })
    .where(eq(subscriptions.id, subscriptionId))
    .returning();

  await creditReferralOnFirstConversion(subscription.userId, updated.amount);

  res.json({ subscription: updated });
});

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

// Razorpay server-to-server webhook (payment.captured, subscription.charged, etc).
// Configure this URL in the Razorpay dashboard once the client has a merchant account.
paymentsRouter.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string | undefined;
  const rawBody = (req as unknown as { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }
  // TODO: handle event types (payment.captured, subscription.cancelled, ...) once
  // real Razorpay subscription plans are set up.
  res.json({ ok: true });
});
