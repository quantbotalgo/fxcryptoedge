"use client";

import { useState } from "react";
import { FlatCard } from "@/components/ui/Card";
import type { Market, SignalAction } from "@/lib/types";

const MARKET_DEFAULTS: Record<Market, { label: string; icon: string; iconBg: string }> = {
  FOREX: { label: "FOREX", icon: "$", iconBg: "#2563eb" },
  CRYPTO: { label: "CRYPTO", icon: "₿", iconBg: "#f7931a" },
  XAUUSD: { label: "GOLD", icon: "Au", iconBg: "#d4af37" },
};

export type SignalFormValues = {
  market: Market;
  action: SignalAction;
  pair: string;
  entry: string;
  stopLoss: string;
  tp1: string;
  tp2: string;
  tp3: string;
  confidence: number;
  note: string;
  icon: string;
  iconBg: string;
};

export function SignalForm({
  title,
  initial,
  submitLabel,
  onSubmit,
}: {
  title: string;
  initial?: Partial<SignalFormValues>;
  submitLabel: string;
  onSubmit: (values: SignalFormValues) => Promise<void>;
}) {
  const [market, setMarket] = useState<Market>(initial?.market ?? "CRYPTO");
  const [action, setAction] = useState<SignalAction>(initial?.action ?? "BUY");
  const [pair, setPair] = useState(initial?.pair ?? "");
  const [entry, setEntry] = useState(initial?.entry ?? "");
  const [stopLoss, setStopLoss] = useState(initial?.stopLoss ?? "");
  const [tp1, setTp1] = useState(initial?.tp1 ?? "");
  const [tp2, setTp2] = useState(initial?.tp2 ?? "");
  const [tp3, setTp3] = useState(initial?.tp3 ?? "");
  const [confidence, setConfidence] = useState(initial?.confidence ?? 75);
  const [note, setNote] = useState(initial?.note ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? MARKET_DEFAULTS.CRYPTO.icon);
  const [iconBg, setIconBg] = useState(initial?.iconBg ?? MARKET_DEFAULTS.CRYPTO.iconBg);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Only reset the icon to the market's default when creating fresh — for an
  // edit, a custom icon someone set shouldn't get clobbered just because they
  // touched the market dropdown.
  function handleMarketChange(m: Market) {
    setMarket(m);
    if (!initial) {
      setIcon(MARKET_DEFAULTS[m].icon);
      setIconBg(MARKET_DEFAULTS[m].iconBg);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        market,
        action,
        pair,
        entry,
        stopLoss,
        tp1,
        tp2,
        tp3,
        confidence,
        note,
        icon,
        iconBg,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[560px] px-8 py-14">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">{title}</h1>
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
            {busy ? "Saving…" : submitLabel}
          </button>
        </form>
      </FlatCard>
    </section>
  );
}
