import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { signals } from "../db/schema.js";
import { requireAdmin, optionalAuth } from "../middleware/auth.js";
import { entitledMarkets, type Market } from "../lib/entitlements.js";
import { applyPaywall } from "../lib/paywall.js";

export const signalsRouter = Router();

const marketFilter = z.enum(["all", "forex", "crypto", "xauusd"]).default("all");

signalsRouter.get("/", optionalAuth, async (req: Request, res: Response) => {
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

signalsRouter.get("/:id", optionalAuth, async (req: Request, res: Response) => {
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

signalsRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
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

signalsRouter.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
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

signalsRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const [row] = await db.delete(signals).where(eq(signals.id, req.params.id)).returning();
  if (!row) return res.status(404).json({ error: "Signal not found" });
  res.json({ ok: true });
});
