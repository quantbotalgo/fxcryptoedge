"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { FlatCard } from "@/components/ui/Card";
import type { Market, SignalAction } from "@/lib/types";
import { AdminGuard } from "../AdminGuard";

const MARKET_DEFAULTS: Record<Market, { label: string; icon: string; iconBg: string }> = {
  FOREX: { label: "FOREX", icon: "$", iconBg: "#2563eb" },
  CRYPTO: { label: "CRYPTO", icon: "₿", iconBg: "#f7931a" },
  XAUUSD: { label: "GOLD", icon: "Au", iconBg: "#d4af37" },
};

function NewSignalForm() {
  const router = useRouter();
  const [market, setMarket] = useState<Market>("CRYPTO");
  const [action, setAction] = useState<SignalAction>("BUY");
  const [pair, setPair] = useState("");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [tp1, setTp1] = useState("");
  const [tp2, setTp2] = useState("");
  const [tp3, setTp3] = useState("");
  const [confidence, setConfidence] = useState(75);
  const [note, setNote] = useState("");
  const [icon, setIcon] = useState(MARKET_DEFAULTS.CRYPTO.icon);
  const [iconBg, setIconBg] = useState(MARKET_DEFAULTS.CRYPTO.iconBg);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleMarketChange(m: Market) {
    setMarket(m);
    setIcon(MARKET_DEFAULTS[m].icon);
    setIconBg(MARKET_DEFAULTS[m].iconBg);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/signals", {
        pair,
        market,
        marketLabel: MARKET_DEFAULTS[market].label,
        action,
        entry,
        stopLoss,
        tp1,
        tp2: tp2 || undefined,
        tp3: tp3 || undefined,
        confidence,
        note,
        icon,
        iconBg,
      });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create signal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[560px] px-8 py-14">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">New signal</h1>
      <FlatCard className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">Market</label>
              <select
                value={market}
                onChange={(e) => handleMarketChange(e.target.value as Market)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-3 py-3 text-sm outline-none"
              >
                <option value="CRYPTO">Crypto</option>
                <option value="FOREX">Forex</option>
                <option value="XAUUSD">Gold (XAUUSD)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as SignalAction)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-3 py-3 text-sm outline-none"
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg/60">Pair</label>
            <input
              required
              placeholder="BTC/USDT"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">Entry</label>
              <input
                required
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">Stop loss</label>
              <input
                required
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">TP1</label>
              <input
                required
                value={tp1}
                onChange={(e) => setTp1(e.target.value)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-3 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">TP2</label>
              <input
                value={tp2}
                onChange={(e) => setTp2(e.target.value)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-3 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">TP3</label>
              <input
                value={tp3}
                onChange={(e) => setTp3(e.target.value)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-3 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg/60">
              Confidence: {confidence}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg/60">Note</label>
            <textarea
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-[13px] bg-gradient-to-br from-accent to-accent-2 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,.32)] disabled:opacity-60"
          >
            {busy ? "Posting…" : "Post signal"}
          </button>
        </form>
      </FlatCard>
    </section>
  );
}

export default function NewSignalPage() {
  return (
    <AdminGuard>
      <NewSignalForm />
    </AdminGuard>
  );
}
