// Mirrors apps/server/src/lib/pricing.ts — kept in sync manually since the two
// apps don't share a package. Only used as a fallback; the API already returns
// computed pricing per billing cycle.
import type { BillingCycle, PriceBreakdown } from "./types";

export function money(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function priceFor(baseMonthly: number, billingCycle: BillingCycle): PriceBreakdown {
  if (billingCycle === "QUARTERLY") {
    const p = Math.round(baseMonthly * 0.75);
    return {
      billingCycle,
      priceMonthly: p,
      strikeMonthly: baseMonthly,
      discountLabel: "25% off",
      billedTotal: p * 3,
      billedLabel: `${money(p * 3)} billed every 3 months`,
    };
  }
  if (billingCycle === "ANNUAL") {
    const p = Math.round(baseMonthly * 0.6);
    return {
      billingCycle,
      priceMonthly: p,
      strikeMonthly: baseMonthly,
      discountLabel: "40% off",
      billedTotal: p * 12,
      billedLabel: `${money(p * 12)} billed yearly`,
    };
  }
  return {
    billingCycle: "MONTHLY",
    priceMonthly: baseMonthly,
    strikeMonthly: null,
    discountLabel: null,
    billedTotal: baseMonthly,
    billedLabel: "Billed monthly",
  };
}
