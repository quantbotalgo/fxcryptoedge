import type { Metadata } from "next";
import { SectionLabel } from "@/components/ui/Misc";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Fx Crypto Edge — subscription, billing, and usage terms for our trading signals platform.",
  alternates: { canonical: "/terms" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-2.5 font-display text-xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-[14.5px] leading-relaxed text-fg/70">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-[760px] px-5 sm:px-8 py-16">
      <SectionLabel>Legal</SectionLabel>
      <h1 className="mt-2.5 mb-2 font-display text-[34px] font-bold tracking-tight sm:text-[42px]">
        Terms of Service
      </h1>
      <p className="text-sm text-fg/50">Last updated: 14 August 2026</p>

      <Section title="1. Who we are">
        <p>
          Fx Crypto Edge (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates fxcryptoedge.in, a
          subscription service that publishes forex, cryptocurrency, and gold (XAU/USD) trade
          signals and related performance information. By creating an account or using the site
          you agree to these Terms.
        </p>
      </Section>

      <Section title="2. Not investment advice">
        <p>
          Signals, commentary, and performance figures on this site are provided for informational
          and educational purposes only. They are not, and should not be treated as, personalized
          investment advice, a recommendation to buy or sell any security or instrument, or a
          guarantee of any outcome. We are not a SEBI-registered Investment Adviser or Research
          Analyst. You are solely responsible for your own trading and investment decisions, and
          should consult a qualified, registered financial advisor before acting on any
          information published here.
        </p>
        <p>
          Trading forex, cryptocurrency, and commodities carries substantial risk of loss and is
          not suitable for every investor. Past performance shown on the Performance page is
          historical and does not guarantee future results.
        </p>
      </Section>

      <Section title="3. Accounts">
        <p>
          You must be at least 18 years old and legally able to enter into contracts in your
          jurisdiction to create an account. You&apos;re responsible for keeping your login
          credentials secure and for all activity under your account. Let us know immediately if
          you suspect unauthorized access.
        </p>
      </Section>

      <Section title="4. Subscriptions and billing">
        <p>
          Paid plans are billed in advance for the billing cycle you select (monthly, quarterly,
          or annual) via Razorpay, in Indian Rupees, inclusive of applicable taxes. Access to the
          markets covered by your plan begins once payment is confirmed.
        </p>
        <p>
          Subscriptions do not renew automatically unless a recurring payment method is explicitly
          set up at checkout. You can cancel future renewal at any time from your dashboard;
          cancelling stops the plan from renewing but does not cut short access you&apos;ve already
          paid for — you keep access until the end of your current billing period.
        </p>
      </Section>

      <Section title="5. Refunds">
        <p>
          Because access to signals is granted immediately on payment, payments are generally
          non-refundable once processed. If you believe you were charged in error, contact us at{" "}
          <a href="mailto:partners@fxcryptoedge.in" className="font-semibold text-accent-soft">
            partners@fxcryptoedge.in
          </a>{" "}
          and we&apos;ll look into it.
        </p>
      </Section>

      <Section title="6. Acceptable use">
        <p>
          Don&apos;t share your account or paid signal content with people outside your own
          subscription, scrape or redistribute the service, attempt to interfere with the
          platform&apos;s security, or use the service for any unlawful purpose. We may suspend or
          terminate accounts that violate these Terms.
        </p>
      </Section>

      <Section title="7. Referral program">
        <p>
          Commission rates and payout terms for the referral/affiliate program are described on
          the Refer &amp; Earn page and may be updated from time to time. We reserve the right to
          withhold or reverse commissions obtained through fraudulent signups or self-referrals.
        </p>
      </Section>

      <Section title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Fx Crypto Edge and its team are not liable for
          any trading losses, lost profits, or indirect or consequential damages arising from your
          use of the service or reliance on any signal or content we publish.
        </p>
      </Section>

      <Section title="9. Changes to these terms">
        <p>
          We may update these Terms from time to time. Continued use of the service after changes
          are posted means you accept the updated Terms.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>These Terms are governed by the laws of India. Disputes are subject to the jurisdiction of Indian courts.</p>
      </Section>

      <Section title="11. Contact">
        <p>
          Questions about these Terms?{" "}
          <a href="mailto:partners@fxcryptoedge.in" className="font-semibold text-accent-soft">
            partners@fxcryptoedge.in
          </a>
        </p>
      </Section>
    </section>
  );
}
