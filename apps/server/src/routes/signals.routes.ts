import { Router } from "express";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { signals } from "../db/schema.js";
import { requireAdmin, optionalAuth } from "../middleware/auth.js";
import { entitledMarkets, type Market } from "../lib/entitlements.js";

export const signalsRouter = Router();

const marketFilter = z.enum(["all", "forex", "crypto", "xauusd"]).default("all");

type SignalRow = typeof signals.$inferSelect;

const REDACTED_FIELDS = ["entry", "stopLoss", "tp1", "tp2", "tp3", "note"] as const;

/**
 * Applies the market paywall: full detail if the viewer is entitled to that
 * signal's market (or is an admin), otherwise the sensitive fields are
 * stripped and `locked: true` is set. Exactly one signal per market — the
 * most recently posted — always stays fully visible as a free sample.
 */
function applyPaywall(rows: SignalRow[], unlocked: Set<Market>, isAdmin: boolean) {
  const freeSamplePerMarket = new Map<Market, string>();
  for (const row of rows) {
    // rows are ordered by postedAt desc, so the first one seen per market is the newest
    if (!freeSamplePerMarket.has(row.market as Market)) {
      freeSamplePerMarket.set(row.market as Market, row.id);
    }
  }

  return rows.map((row) => {
    const isFreeSample = freeSamplePerMarket.get(row.market as Market) === row.id;
    const hasAccess = isAdmin || unlocked.has(row.market as Market) || isFreeSample;
    if (hasAccess) return { ...row, locked: false };

    const redacted = { ...row, locked: true } as SignalRow & { locked: boolean };
    for (const field of REDACTED_FIELDS) {
      (redacted as Record<string, unknown>)[field] = null;
    }
    return redacted;
  });
}

signalsRouter.get("/", optionalAuth, async (req, res) => {
  const filter = marketFilter.safeParse((req.query.market as string)?.toLowerCase() ?? "all");
  const market = filter.success ? filter.data : "all";

  const rows =
    market === "all"
      ? await db.query.signals.findMany({ orderBy: desc(signals.postedAt) })
      : await db.query.signals.findMany({
          where: eq(signals.market, market.toUpperCase() as "FOREX" | "CRYPTO" | "XAUUSD"),
          orderBy: desc(signals.postedAt),
        });

  const isAdmin = req.user?.role === "ADMIN";
  const unlocked = isAdmin ? new Set<Market>() : await entitledMarkets(req.user?.sub ?? null);

  res.json({ signals: applyPaywall(rows, unlocked, isAdmin) });
});

signalsRouter.get("/:id", optionalAuth, async (req, res) => {
  const row = await db.query.signals.findFirst({ where: eq(signals.id, req.params.id) });
  if (!row) return res.status(404).json({ error: "Signal not found" });

  const isAdmin = req.user?.role === "ADMIN";
  const unlocked = isAdmin ? new Set<Market>() : await entitledMarkets(req.user?.sub ?? null);
  const [signal] = applyPaywall([row], unlocked, isAdmin);
  res.json({ signal });
});

const createSchema = z.object({
  pair: z.string().min(1),
  market: z.enum(["FOREX", "CRYPTO", "XAUUSD"]),
  marketLabel: z.string().min(1),
  action: z.enum(["BUY", "SELL"]),
  entry: z.string().min(1),
  stopLoss: z.string().min(1),
  tp1: z.string().min(1),
  tp2: z.string().optional(),
  tp3: z.string().optional(),
  confidence: z.number().int().min(0).max(100),
  note: z.string().min(1),
  icon: z.string().min(1),
  iconBg: z.string().min(1),
  status: z.enum(["ACTIVE", "CLOSED", "TP_HIT", "SL_HIT"]).optional(),
});

signalsRouter.post("/", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const [row] = await db
    .insert(signals)
    .values({ ...parsed.data, createdById: req.user!.sub })
    .returning();
  res.status(201).json({ signal: row });
});

const updateSchema = createSchema.partial().extend({
  returnPct: z.number().optional(),
});

signalsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const patch: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.status && parsed.data.status !== "ACTIVE" && !("closedAt" in patch)) {
    patch.closedAt = new Date();
  }

  const [row] = await db
    .update(signals)
    .set(patch)
    .where(eq(signals.id, req.params.id))
    .returning();
  if (!row) return res.status(404).json({ error: "Signal not found" });
  res.json({ signal: row });
});

signalsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const [row] = await db.delete(signals).where(eq(signals.id, req.params.id)).returning();
  if (!row) return res.status(404).json({ error: "Signal not found" });
  res.json({ ok: true });
});
