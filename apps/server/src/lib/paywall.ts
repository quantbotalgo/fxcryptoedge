import type { Market } from "./entitlements.js";

const REDACTED_FIELDS = ["entry", "stopLoss", "tp1", "tp2", "tp3", "note"] as const;

/**
 * Applies the market paywall to a list of signal-shaped rows: full detail if
 * the viewer is entitled to that signal's market (or is an admin), otherwise
 * the sensitive fields are stripped and `locked: true` is set. Exactly one
 * signal per market — the most recently posted — always stays fully visible
 * as a free sample. Shared by /api/signals and /api/performance so both
 * endpoints enforce the exact same access rules and can't drift apart.
 */
export function applyPaywall<T extends { id: string; market: string; postedAt: Date | string }>(
  rows: T[],
  unlocked: Set<Market>,
  isAdmin: boolean
): (T & { locked: boolean })[] {
  const freeSamplePerMarket = new Map<Market, string>();
  for (const row of rows) {
    // rows must be ordered by postedAt desc, so the first one seen per market is the newest
    if (!freeSamplePerMarket.has(row.market as Market)) {
      freeSamplePerMarket.set(row.market as Market, row.id);
    }
  }

  return rows.map((row) => {
    const isFreeSample = freeSamplePerMarket.get(row.market as Market) === row.id;
    const hasAccess = isAdmin || unlocked.has(row.market as Market) || isFreeSample;
    if (hasAccess) return { ...row, locked: false };

    const redacted = { ...row, locked: true };
    for (const field of REDACTED_FIELDS) {
      (redacted as Record<string, unknown>)[field] = null;
    }
    return redacted;
  });
}
