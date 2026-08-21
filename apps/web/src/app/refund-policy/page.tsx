import type { Metadata } from "next";
import { SectionLabel } from "@/components/ui/Misc";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Fx Crypto Edge's refund and cancellation policy for subscription plans.",
  alternates: { canonical: "/refund-policy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-2.5 font-display text-xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-[14.5px] leading-relaxed text-fg/70">{children}</div>
    </div>
  );
}

export default function RefundPolicyPage() {
  return (
    <section className="mx-auto max-w-[760px] px-5 sm:px-8 py-16">
      <SectionLabel>Legal</SectionLabel>
      <h1 className="mt-2.5 mb-2 font-display text-[34px] font-bold tracking-tight sm:text-[42px]">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="text-sm text-fg/50">Last updated: 22 August 2026</p>

      <Section title="Cancellation">
        <p>
          You can cancel your subscription at any time from your account dashboard. Cancelling stops
          your plan from renewing at the end of the current billing period — it does not cut short
          access you&apos;ve already paid for. You keep full access to your plan&apos;s markets and
          features until the end of the period you&apos;ve already paid for, and your plan simply
          won&apos;t renew after that.
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          Because access to signals and performance data is granted immediately upon successful
          payment, subscription payments are generally non-refundable once processed.
        </p>
        <p>
          If you were charged in error — for example, a duplicate charge, an incorrect amount, or a
          payment that didn&apos;t result in account access — contact us at{" "}
          <a href="mailto:partners@fxcryptoedge.in" className="font-semibold text-accent-soft">
            partners@fxcryptoedge.in
          </a>{" "}
          with your order/payment reference and we&apos;ll review it. Approved refunds are processed
          back to the original payment method within 5–7 business days.
        </p>
      </Section>

      <Section title="Failed or pending payments">
        <p>
          If a payment is deducted but your subscription doesn&apos;t show as active within a few
          minutes, don&apos;t retry the payment immediately — email us with your payment reference
          and we&apos;ll confirm the status and activate your plan or issue a refund if the charge
          didn&apos;t go through on our end.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about a charge or cancellation?{" "}
          <a href="mailto:partners@fxcryptoedge.in" className="font-semibold text-accent-soft">
            partners@fxcryptoedge.in
          </a>
        </p>
      </Section>
    </section>
  );
}
