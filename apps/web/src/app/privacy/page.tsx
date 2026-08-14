import { SectionLabel } from "@/components/ui/Misc";

export const metadata = { title: "Privacy Policy — Fx Crypto Edge" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-2.5 font-display text-xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-[14.5px] leading-relaxed text-fg/70">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-[760px] px-5 sm:px-8 py-16">
      <SectionLabel>Legal</SectionLabel>
      <h1 className="mt-2.5 mb-2 font-display text-[34px] font-bold tracking-tight sm:text-[42px]">
        Privacy Policy
      </h1>
      <p className="text-sm text-fg/50">Last updated: 14 August 2026</p>

      <Section title="1. What we collect">
        <p>
          When you create an account, we collect your name and email address (either directly, or
          from your Google account if you sign in with Google). If you subscribe to a paid plan,
          Razorpay processes your payment and shares confirmation details with us (such as
          amount, plan, and a payment reference) — we don&apos;t see or store your card, UPI, or
          bank details ourselves.
        </p>
        <p>
          We also automatically collect basic usage information (like pages visited and general
          device/browser info) to keep the service running reliably and secure.
        </p>
      </Section>

      <Section title="2. How we use it">
        <p>
          We use your data to run your account, deliver the signals and features included in your
          plan, process payments, send you service-related emails (like password resets or
          receipts), track referral commissions if you participate in the referral program, and
          improve the product.
        </p>
        <p>We don&apos;t sell your personal data to third parties.</p>
      </Section>

      <Section title="3. Who we share it with">
        <p>We share data with the third-party services that power the platform, and only as needed for them to do their job:</p>
        <ul className="ml-5 list-disc">
          <li>Razorpay — to process subscription payments.</li>
          <li>Google — if you choose to sign in with Google.</li>
          <li>Resend — to deliver transactional emails (e.g. password reset links).</li>
          <li>Our hosting providers (Vercel, Render) — to run the website and store data.</li>
        </ul>
        <p>
          We may also disclose information if required by law, or to protect the rights, safety,
          or property of Fx Crypto Edge, our users, or the public.
        </p>
      </Section>

      <Section title="4. Cookies">
        <p>
          We use a small number of essential cookies (like the login session cookie) to keep you
          signed in. We don&apos;t use third-party advertising or tracking cookies.
        </p>
      </Section>

      <Section title="5. Data retention">
        <p>
          We keep your account data for as long as your account is active, and for a reasonable
          period afterward to meet legal, tax, and accounting obligations. You can request deletion
          of your account at any time (see below).
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          You can review or update your account details, and request that we delete your account
          and associated personal data, by emailing us at{" "}
          <a href="mailto:partners@fxcryptoedge.in" className="font-semibold text-accent-soft">
            partners@fxcryptoedge.in
          </a>
          . We may need to retain certain records (such as payment history) where required by law.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          Passwords are stored using industry-standard hashing (never in plain text), and your
          connection to the site is encrypted (HTTPS). No system is 100% secure, but we take
          reasonable technical measures to protect your data.
        </p>
      </Section>

      <Section title="8. Children">
        <p>Fx Crypto Edge is not directed at, and should not be used by, anyone under the age of 18.</p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date above.</p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions about this Policy or your data?{" "}
          <a href="mailto:partners@fxcryptoedge.in" className="font-semibold text-accent-soft">
            partners@fxcryptoedge.in
          </a>
        </p>
      </Section>
    </section>
  );
}
