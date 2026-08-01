// Billing-cycle pricing logic — ported 1:1 from the client's design prototype
// (3 months = 25% off, billed quarterly; annual = 40% off, billed yearly).

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export type PriceBreakdown = {
  billingCycle: BillingCycle;
  priceMonthly: number;
  strikeMonthly: number | null;
  discountLabel: string | null;
  billedTotal: number;
  billedLabel: string;
};

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
