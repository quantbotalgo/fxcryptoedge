"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PerformanceResponse } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Misc";

function fmtPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
}

function formatEntry(entry: string | null) {
  return entry ?? "••••";
}

function statusStyleFor(status: PerformanceResponse["trades"][number]["status"]) {
  if (status === "ACTIVE") return { bg: "rgba(139,124,246,.18)", color: "#a99bf9", label: "Active" };
  if (status === "TP_HIT") return { bg: "rgba(52,211,153,.16)", color: "#34d399", label: "TP Hit" };
  if (status === "SL_HIT")
    return { bg: "rgba(255,255,255,.07)", color: "rgba(244,243,250,.55)", label: "SL Hit" };
  return { bg: "rgba(255,255,255,.07)", color: "rgba(244,243,250,.55)", label: "Closed" };
}

export function PerformanceClient() {
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PerformanceResponse>("/api/performance")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-[1180px] px-5 sm:px-8 py-20 text-center text-fg/50">
        Loading performance…
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mx-auto max-w-[1180px] px-5 sm:px-8 py-20 text-center text-fg/60">
        Performance data is unavailable right now. Make sure the API server is running.
      </section>
    );
  }

  const { stats, trades } = data;
  const best = trades.reduce((m, t) => Math.max(m, t.returnPct ?? -Infinity), -Infinity);
  const worst = trades.reduce((m, t) => Math.min(m, t.returnPct ?? Infinity), Infinity);

  const statCards = [
    { label: "WIN RATE", val: `${stats.winRate}%`, sub: stats.winLossLabel, color: "#a99bf9", glyph: "◎" },
    {
      label: "CUMULATIVE RETURN",
      val: fmtPct(stats.cumulativeReturn),
      sub: `${stats.closedTrades} trades`,
      color: stats.cumulativeReturn >= 0 ? "#34d399" : "#f87171",
      glyph: stats.cumulativeReturn >= 0 ? "↗" : "↘",
    },
    {
      label: "AVG PER TRADE",
      val: fmtPct(stats.avgPerTrade),
      sub: "across closed",
      color: stats.avgPerTrade >= 0 ? "#34d399" : "#f87171",
      glyph: stats.avgPerTrade >= 0 ? "↗" : "↘",
    },
    {
      label: "BEST / WORST",
      val: Number.isFinite(best) ? fmtPct(best) : "—",
      sub: Number.isFinite(worst) ? `worst ${fmtPct(worst)}` : "—",
      color: "#fbbf24",
      glyph: "↗",
    },
  ];

  return (
    <section className="mx-auto max-w-[1180px] px-5 sm:px-8 pb-5 pt-14">
      <SectionLabel>Performance</SectionLabel>
      <h1 className="mt-2.5 mb-1.5 font-display text-[36px] font-bold tracking-tight sm:text-[44px]">
        Verified, transparent results.
      </h1>
      <p className="mb-6 text-[15.5px] text-fg/60">Every closed trade, on the record.</p>

      <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-[22px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] tracking-[.12em] text-fg/50">{s.label}</span>
              <span className="text-base" style={{ color: s.color }}>
                {s.glyph}
              </span>
            </div>
            <div className="my-3 font-display text-[30px] font-bold sm:text-[34px]" style={{ color: s.color }}>
              {s.val}
            </div>
            <div className="text-[13px] text-fg/50">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-white/[.08] bg-white/[.025]">
        <div className="flex items-center justify-between px-5 pb-4 pt-[22px] sm:px-6">
          <span className="font-display text-xl font-semibold">Trade history</span>
          <span className="text-[13px] text-fg/45">{trades.length} results</span>
        </div>

        {/* Desktop/tablet: dense grid table */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-[1.4fr_.8fr_1fr_1fr_.8fr] px-6 pb-2.5 font-mono text-[10.5px] tracking-[.1em] text-fg/40">
            <span>PAIR</span>
            <span>ACTION</span>
            <span>STATUS</span>
            <span className="text-right">ENTRY</span>
            <span className="text-right">RETURN %</span>
          </div>
          {trades.map((t) => {
            const retColor =
              t.returnPct === null ? "rgba(244,243,250,.4)" : t.returnPct < 0 ? "#f87171" : "#34d399";
            const statusStyle = statusStyleFor(t.status);
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1.4fr_.8fr_1fr_1fr_.8fr] items-center border-t border-white/[.05] px-6 py-3.5"
              >
                <div>
                  <div className="font-display text-[14.5px] font-semibold">{t.pair}</div>
                  <div className="font-mono text-[9.5px] tracking-[.08em] text-fg/38">{t.marketLabel}</div>
                </div>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: t.action === "BUY" ? "#34d399" : "#f87171" }}
                >
                  {t.action === "BUY" ? "↗" : "↘"} {t.action}
                </span>
                <span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>
                </span>
                <span
                  className={`text-right font-mono text-sm ${t.locked ? "select-none text-fg/35" : ""}`}
                >
                  {formatEntry(t.entry)}
                </span>
                <span className="text-right font-mono text-sm font-semibold" style={{ color: retColor }}>
                  {t.returnPct === null ? "—" : fmtPct(t.returnPct)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile: stacked cards — the 5-column grid above is too cramped
            below the sm breakpoint to stay legible. */}
        <div className="sm:hidden">
          {trades.map((t) => {
            const retColor =
              t.returnPct === null ? "rgba(244,243,250,.4)" : t.returnPct < 0 ? "#f87171" : "#34d399";
            const statusStyle = statusStyleFor(t.status);
            return (
              <div key={t.id} className="border-t border-white/[.05] px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-[14.5px] font-semibold">{t.pair}</div>
                    <div className="font-mono text-[9.5px] tracking-[.08em] text-fg/38">{t.marketLabel}</div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: t.action === "BUY" ? "#34d399" : "#f87171" }}
                  >
                    {t.action === "BUY" ? "↗" : "↘"} {t.action}
                    <span
                      className={`ml-2 font-mono text-[12.5px] font-normal ${t.locked ? "select-none text-fg/35" : "text-fg/60"}`}
                    >
                      @ {formatEntry(t.entry)}
                    </span>
                  </span>
                  <span className="font-mono text-sm font-semibold" style={{ color: retColor }}>
                    {t.returnPct === null ? "—" : fmtPct(t.returnPct)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
