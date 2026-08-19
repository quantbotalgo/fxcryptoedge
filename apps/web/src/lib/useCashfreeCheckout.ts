"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { BillingCycle, Plan } from "@/lib/types";

type CashfreeCheckoutResult = {
  error?: { message?: string };
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
};
type CashfreeInstance = {
  checkout: (opts: Record<string, unknown>) => Promise<CashfreeCheckoutResult>;
};

declare global {
  interface Window {
    Cashfree?: (opts: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}

type CreateOrderResponse = {
  orderId: string;
  paymentSessionId: string;
  subscriptionId: string;
};

/**
 * Cashfree counterpart to useSubscribeCheckout — same shape (subscribe/busy/error)
 * so PricingClient can swap gateways without touching the buttons. Uses the
 * "_modal" popup variant so the UX matches Razorpay's checkout popup, instead
 * of a full-page redirect. Requires the Cashfree v3 SDK script to already be
 * on the page (loaded once in PricingClient) and `cashfreeMode` from
 * GET /api/payments/status (sandbox vs production — must match the keys
 * configured on the server, or the SDK will reject the session).
 */
export function useCashfreeCheckout(plan: Plan, billingCycle: BillingCycle, cashfreeMode: "sandbox" | "production") {
  const router = useRouter();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    if (!user) {
      router.push(`/signup?next=/pricing`);
      return;
    }
    setError(null);

    if (!window.Cashfree) {
      setError("Payment widget is still loading — try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      const order = await api.post<CreateOrderResponse>("/api/payments/create-order-cashfree", {
        planId: plan.id,
        billingCycle,
      });

      const cashfree = window.Cashfree({ mode: cashfreeMode });
      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result.error) {
        setError(result.error.message || "Payment was not completed.");
        setBusy(false);
        return;
      }

      // Whatever the popup reports, the actual result is confirmed
      // server-side against Cashfree's Get Order API — this call is what
      // actually activates the subscription.
      await api.post("/api/payments/verify-cashfree", {
        subscriptionId: order.subscriptionId,
        orderId: order.orderId,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return { subscribe, busy, error };
}
