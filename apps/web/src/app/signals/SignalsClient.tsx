"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Misc";
import { api } from "@/lib/api";
import type { Signal, Market } from "@/lib/types";

const FILTERS: { label: string; value: "all" | Market }[] = [
  { label: "All", value: "all" },
  { label: "XAU/USD", value: "XAUUSD" },
  { label: "Forex", value: "FOREX" },
  { label: "Crypto", value: "CRYPTO" },
];

const LOCKED_LEVELS = [
  { label: "ENTRY", val: "••••", color: "#f4f3fa" },
  { label: "STOP LOSS", val: "••••", color: "#f87171" },
  { label: "TP1", val: "••••", color: "#34d399" },
];

function levelsFor(s: Signal) {
  if (s.locked) return LOCKED_LEVELS;
  const levels = [
    { label: "ENTRY", val: s.entry ?? "—", color: "#f4f3fa" },
    { label: "STOP LOSS", val: s.stopLoss ?? "—", color: "#f87171" },
    { label: "TP1", val: s.tp1 ?? "—", color: "#34d399" },
  ];
  if (s.tp2) levels.push({ label: "TP2", val: s.tp2, color: "#34d399" });
  if (s.tp3) levels.push({ label: "TP3", val: s.tp3, color: "#34d399" });
  return levels;
}

function formatTime(iso: string) {
  return new Date(iso)
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    .toUpperCase()
    .replace(",", "");
}

export function SignalsClient() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Market>("all");

  useEffect(() => {
    api
      .get<{ signals: Signal[] }>("/api/signals")
      .then((data) => setSignals(data.signals))
      .catch(() => setSignals([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? signals : signals.filter((s) => s.market === filter)),
    [signals, filter]
  );

  return (
    <section className="mx-auto max-w-[1180px] px-8 pb-5 pt-14">
      <div className="flex flex-wrap items-end justify-between gap-x-[18px] gap-y-4">
        <div>
          <h1 className="font-display text-[36px] font-bold tracking-tight sm:text-[44px]">
            Live Signals
          </h1>
          <p className="mt-2 text-[15.5px] text-fg/60">Updates in real time. All times in IST.</p>
        </div>
        <div className="flex gap-1.5 rounded-[14px] border border-white/[.09] bg-white/[.03] p-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="rounded-[10px] px-4 py-2 text-[13.5px] font-semibold transition-colors cursor-pointer"
              style={{
                background: filter === f.value ? "#8b7cf6" : "transparent",
                color: filter === f.value ? "#0b0910" : "rgba(244,243,250,.7)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-fg/50">Loading signals…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-fg/50">No signals for this market yet.</p>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((s) => (
            <Card key={s.id} className="p-[22px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] text-[16px] font-bold"
                    style={{ background: s.iconBg, color: ["#14f195", "#d4af37"].includes(s.iconBg) ? "#0b0910" : "#fff" }}
                  >
                    {s.icon}
                  </span>
                  <div>
                    <div className="font-display text-[17px] font-semibold">{s.pair}</div>
                    <div className="font-mono text-[10.5px] tracking-[.1em] text-fg/45">
                      {s.marketLabel}
                    </div>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>

              <div className="my-4 flex items-center justify-between">
                <span
                  className="font-display text-[26px] font-bold"
                  style={{ color: s.action === "BUY" ? "#34d399" : "#f87171" }}
                >
                  {s.action === "BUY" ? "↗" : "↘"} {s.action}
                </span>
                <span className="text-[13px] text-fg/55">
                  conf <span className="font-semibold text-fg">{s.confidence}%</span>
                </span>
              </div>

              <div className="relative">
                <div className={s.locked ? "pointer-events-none select-none blur-[6px]" : undefined}>
                  <div className="grid grid-cols-3 gap-2.5">
                    {levelsFor(s).map((lv) => (
                      <div key={lv.label} className="rounded-[11px] border border-white/[.05] bg-white/[.04] px-3 py-2.5">
                        <div className="font-mono text-[9.5px] tracking-[.08em] text-fg/42">{lv.label}</div>
                        <div className="mt-0.5 font-mono text-[15px] font-semibold" style={{ color: lv.color }}>
                          {lv.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mb-2.5 mt-4 text-[13.5px] leading-relaxed text-fg/60">
                    {s.locked ? "Subscribe to unlock the full setup notes and reasoning behind this call." : s.note}
                  </p>
                </div>

                {s.locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[.12] bg-[#0d0b16]/90 text-base">
                      🔒
                    </span>
                    <Link
                      href="/pricing"
                      className="rounded-full bg-accent px-4 py-2 text-[12.5px] font-semibold text-[#0b0910] cursor-pointer"
                    >
                      Subscribe to unlock
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-4 font-mono text-[10.5px] tracking-[.06em] text-fg/38">
                {formatTime(s.postedAt)} IST
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
