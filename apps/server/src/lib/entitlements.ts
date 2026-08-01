import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "../db/client.js";
import { subscriptions, plans } from "../db/schema.js";

export type Market = "FOREX" | "CRYPTO" | "XAUUSD";

/**
 * Markets a user is currently entitled to see full signal detail for, based on
 * active (and not-yet-expired) subscriptions. Admins are handled separately by
 * the caller — this only looks at paid entitlements.
 */
export async function entitledMarkets(userId: string | null): Promise<Set<Market>> {
  if (!userId) return new Set();

  const now = new Date();
  const rows = await db
    .select({ markets: plans.markets })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "ACTIVE"),
        or(isNull(subscriptions.expiresAt), gt(subscriptions.expiresAt, now))
      )
    );

  const set = new Set<Market>();
  for (const row of rows) {
    for (const m of row.markets ?? []) set.add(m as Market);
  }
  return set;
}
