"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import { Card } from "@/components/ui/Card";
import { priceFor, money } from "@/lib/pricing";
import { useSubscribeCheckout } from "@/lib/useSubscribeCheckout";
import type { BillingCycle, Plan } from "@/lib/types";

const BILL_TABS: { label: string; value: BillingCycle; save: string | null }[] = [
  { label: "Monthly", value: "MONTHLY", save: null },
  { label: "3 Months", value: "QUARTERLY", save: "SAVE 25%" },
  { label: "Annual", value: "ANNUAL", save: "SAVE 40%" },
];

function PriceCard({ plan, billingCycle }: { plan: Plan; billingCycle: BillingCycle }) {
  const pricing = priceFor(plan.basePriceMonthly, billingCycle);
  const { subscribe, busy, error } = useSubscribeCheckout(plan, billingCycle);

  return (
    <Card className="flex flex-col p-6">
      <div className="font-display text-lg font-semibold">{plan.name}</div>
      <div className="mb-2 mt-1 font-mono text-[11px] tracking-[.12em] text-accent-soft">{plan.market}</div>
      <p className="mb-4 flex-1 text-[14px] text-fg/62">{plan.description}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[32px] font-bold">{money(pricing.priceMonthly)}</span>
        <span className="text-sm text-fg/55">/ month</span>
      </div>
      {pricing.discountLabel && (
        <div className="mt-1 text-[13px] text-fg/50">
          <span className="line-through">{money(pricing.strikeMonthly!)}</span> · {pricing.discountLabel}
        </div>
      )}
      <div className="mt-1.5 text-[12.5px] text-fg/45">{pricing.billedLabel}</div>
      <button
        onClick={subscribe}
        disabled={busy}
        className="mt-5 rounded-[13px] bg-gradient-to-br from-accent to-accent-2 py-3 text-center text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,.32)] disabled:opacity-60"
      >
        {busy ? "Please wait…" : `Get ${plan.name}`}
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <div className="mt-4 flex flex-col gap-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-[13.5px] text-fg/75">
            <span className="text-success">✓</span>
            {f}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProSubscribeButton({ plan, billingCycle }: { plan: Plan; billingCycle: BillingCycle }) {
  const { subscribe, busy, error } = useSubscribeCheckout(plan, billingCycle);
  return (
    <>
      <button
        onClick={subscribe}
        disabled={busy}
        className="mt-5 w-full rounded-[13px] bg-gradient-to-br from-accent to-accent-2 py-3.5 text-center text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,.32)] disabled:opacity-60"
      >
        {busy ? "Please wait…" : "Get Pro"}
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </>
  );
}

export function PricingClient({ plans }: { plans: Plan[] }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");

  const basic = useMemo(() => plans.filter((p) => p.tier === "BASIC"), [plans]);
  const lite = useMemo(() => plans.filter((p) => p.tier === "LITE"), [plans]);
  const pro = useMemo(() => plans.find((p) => p.tier === "PRO"), [plans]);
  const proPricing = pro ? priceFor(pro.basePriceMonthly, billingCycle) : null;

  return (
    <section className="mx-auto max-w-[1180px] px-8 pb-5 pt-14">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[.22em] text-accent">Pricing</div>
        <h1 className="mt-3 mb-2 font-display text-[36px] font-bold tracking-tight sm:text-[46px]">
          Plans priced in ₹
        </h1>
        <p className="mx-auto mb-6 max-w-[520px] text-[15.5px] text-fg/60">
          Cancel anytime. GST included. Pay via UPI, cards, or net banking.
        </p>
        <div className="inline-flex gap-1.5 rounded-full border border-white/[.09] bg-white/[.03] p-1.5">
          {BILL_TABS.map((b) => (
            <button
              key={b.value}
              onClick={() => setBillingCycle(b.value)}
              className="inline-flex items-center gap-2 rounded-full px-[18px] py-2.5 text-sm font-semibold cursor-pointer"
              style={{
                background:
                  billingCycle === b.value ? "linear-gradient(135deg,#8b7cf6,#6366f1)" : "transparent",
                color: billingCycle === b.value ? "#fff" : "rgba(244,243,250,.7)",
              }}
            >
              {b.label}
              {b.save && (
                <span className="rounded-full bg-success/[.16] px-2 py-0.5 text-[11px] font-semibold text-success">
                  {b.save}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-bold tracking-tight sm:text-[30px]">Basic</h2>
        <span className="font-mono text-[11px] tracking-[.14em] text-fg/40">SINGLE MARKET</span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {basic.map((p) => (
          <PriceCard key={p.id} plan={p} billingCycle={billingCycle} />
        ))}
      </div>

      <div className="mb-4 mt-11 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-bold tracking-tight sm:text-[30px]">Lite</h2>
        <span className="font-mono text-[11px] tracking-[.14em] text-fg/40">TWO MARKETS</span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {lite.map((p) => (
          <PriceCard key={p.id} plan={p} billingCycle={billingCycle} />
        ))}
      </div>

      {pro && proPricing && (
        <>
          <div className="mb-4 mt-11 flex items-baseline justify-between">
            <h2 className="font-display text-[26px] font-bold tracking-tight sm:text-[30px]">Pro</h2>
            <span className="font-mono text-[11px] tracking-[.14em] text-fg/40">ALL MARKETS</span>
          </div>
          <div
            className="relative rounded-[22px] border border-accent/40 p-8 shadow-[0_24px_60px_rgba(99,102,241,.18)]"
            style={{ background: "linear-gradient(140deg, rgba(139,124,246,.16), rgba(99,102,241,.06))" }}
          >
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent to-accent-2 px-3.5 py-1.5 text-[11.5px] font-bold tracking-wide text-white">
              MOST POPULAR
            </span>
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              <div>
                <div className="font-display text-2xl font-bold">Pro</div>
                <div className="my-2 font-mono text-[11px] tracking-[.12em] text-accent-soft">{pro.market}</div>
                <p className="mb-[18px] text-[14.5px] text-fg/62">{pro.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[44px] font-bold">{money(proPricing.priceMonthly)}</span>
                  <span className="text-sm text-fg/55">/ month</span>
                </div>
                {proPricing.discountLabel && (
                  <div className="mt-1 text-[13px] text-fg/50">
                    <span className="line-through">{money(proPricing.strikeMonthly!)}</span> ·{" "}
                    {proPricing.discountLabel}
                  </div>
                )}
                <div className="mt-1.5 text-[12.5px] text-fg/45">{proPricing.billedLabel}</div>
                <ProSubscribeButton plan={pro} billingCycle={billingCycle} />
              </div>
              <div className="flex flex-col gap-3">
                {pro.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[14.5px] text-fg/82">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs text-accent-soft">
                      ✓
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
