import { Router } from "express";
import { desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { signals } from "../db/schema.js";

export const performanceRouter = Router();

type Row = typeof signals.$inferSelect;

function marketBreakdown(closed: Row[], market: "FOREX" | "CRYPTO" | "XAUUSD") {
  const rows = closed.filter((r) => r.market === market);
  const wins = rows.filter((r) => (r.returnPct ?? 0) > 0).length;
  const losses = rows.filter((r) => (r.returnPct ?? 0) <= 0).length;
  const winRate = rows.length ? (wins / rows.length) * 100 : 0;
  const cumulative = rows.reduce((sum, r) => sum + (r.returnPct ?? 0), 0);
  return {
    market,
    winRate: Number(winRate.toFixed(1)),
    trades: rows.length,
    wins,
    losses,
    cumulativeReturn: Number(cumulative.toFixed(2)),
  };
}

performanceRouter.get("/", async (_req, res) => {
  const all = await db.query.signals.findMany({ orderBy: desc(signals.postedAt) });
  const closed = all.filter((r) => r.status !== "ACTIVE" && r.returnPct !== null);

  const wins = closed.filter((r) => (r.returnPct ?? 0) > 0).length;
  const losses = closed.filter((r) => (r.returnPct ?? 0) <= 0).length;
  const winRate = closed.length ? (wins / closed.length) * 100 : 0;
  const cumulativeReturn = closed.reduce((sum, r) => sum + (r.returnPct ?? 0), 0);
  const avgPerTrade = closed.length ? cumulativeReturn / closed.length : 0;
  const best = closed.reduce((m, r) => Math.max(m, r.returnPct ?? 0), 0);
  const worst = closed.reduce((m, r) => Math.min(m, r.returnPct ?? 0), 0);

  res.json({
    stats: {
      winRate: Number(winRate.toFixed(1)),
      winLossLabel: `${wins}W · ${losses}L`,
      cumulativeReturn: Number(cumulativeReturn.toFixed(2)),
      closedTrades: closed.length,
      avgPerTrade: Number(avgPerTrade.toFixed(2)),
      best: Number(best.toFixed(2)),
      worst: Number(worst.toFixed(2)),
    },
    byMarket: [
      marketBreakdown(closed, "FOREX"),
      marketBreakdown(closed, "CRYPTO"),
      marketBreakdown(closed, "XAUUSD"),
    ],
    trades: all,
  });
});
