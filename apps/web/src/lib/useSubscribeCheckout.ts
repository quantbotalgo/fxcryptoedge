"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { BillingCycle, Plan } from "@/lib/types";

type RazorpayCheckoutInstance = { open: () => void };
type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckoutInstance;
  }
}

type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  subscriptionId: string;
};

/**
 * Drives the Razorpay Checkout popup for a given plan: creates a pending
 * order+subscription on our server, opens the widget, and verifies the
 * payment signature once Razorpay calls back. Requires the Razorpay
 * checkout.js script to already be on the page (loaded once in PricingClient).
 */
export function useSubscribeCheckout(plan: Plan, billingCycle: BillingCycle) {
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

    if (!window.Razorpay) {
      setError("Payment widget is still loading — try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      const order = await api.post<CreateOrderResponse>("/api/payments/create-order", {
        planId: plan.id,
        billingCycle,
      });

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Fx Crypto Edge",
        description: `${plan.name} — ${plan.market}`,
        prefill: { email: user.email, name: user.name },
        theme: { color: "#6366f1" },
        handler: async (resp: RazorpaySuccessResponse) => {
          try {
            await api.post("/api/payments/verify", {
              subscriptionId: order.subscriptionId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            router.push("/dashboard");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return { subscribe, busy, error };
}
