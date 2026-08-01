import { Router } from "express";
import { asc } from "drizzle-orm";
import { db } from "../db/client.js";
import { plans } from "../db/schema.js";
import { priceFor, type BillingCycle } from "../lib/pricing.js";

export const plansRouter = Router();

const VALID_CYCLES: BillingCycle[] = ["MONTHLY", "QUARTERLY", "ANNUAL"];

plansRouter.get("/", async (req, res) => {
  const cycleParam = (req.query.billingCycle as string)?.toUpperCase();
  const billingCycle: BillingCycle = VALID_CYCLES.includes(cycleParam as BillingCycle)
    ? (cycleParam as BillingCycle)
    : "MONTHLY";

  const rows = await db.query.plans.findMany({ orderBy: asc(plans.sortOrder) });
  const withPricing = rows.map((p) => ({
    ...p,
    pricing: priceFor(p.basePriceMonthly, billingCycle),
  }));

  res.json({ billingCycle, plans: withPricing });
});
