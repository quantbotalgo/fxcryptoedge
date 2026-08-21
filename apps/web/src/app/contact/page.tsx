import type { Metadata } from "next";
import { SectionLabel } from "@/components/ui/Misc";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Fx Crypto Edge for support, billing questions, or general inquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[760px] px-5 sm:px-8 py-16">
      <SectionLabel>Support</SectionLabel>
      <h1 className="mt-2.5 mb-2 font-display text-[34px] font-bold tracking-tight sm:text-[42px]">
        Contact Us
      </h1>
      <p className="mb-8 text-[15px] leading-relaxed text-fg/65">
        Have a question about your subscription, a signal, or billing? Reach out and we&apos;ll get back to
        you as soon as we can.
      </p>

      <div className="flex flex-col gap-6 text-[14.5px] leading-relaxed text-fg/70">
        <div>
          <h2 className="mb-1.5 font-display text-lg font-semibold text-fg">Email</h2>
          <a href="mailto:partners@fxcryptoedge.in" className="font-semibold text-accent-soft">
            partners@fxcryptoedge.in
          </a>
          <p className="mt-1 text-fg/55">We typically respond within 1–2 business days.</p>
        </div>

        <div>
          <h2 className="mb-1.5 font-display text-lg font-semibold text-fg">What we can help with</h2>
          <ul className="flex flex-col gap-1.5">
            <li>Subscription, billing, and refund questions</li>
            <li>Account access or login issues</li>
            <li>Questions about a specific signal or the performance track record</li>
            <li>Referral program and commission queries</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-1.5 font-display text-lg font-semibold text-fg">Business</h2>
          <p>
            Fx Crypto Edge operates fxcryptoedge.in, a subscription platform for forex, crypto, and gold
            (XAUUSD) market signals, serving customers across India.
          </p>
        </div>
      </div>
    </section>
  );
}
