"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { FlatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Misc";
import type { Signal, SignalStatus } from "@/lib/types";
import { AdminGuard } from "./AdminGuard";

const NEXT_STATUS: Record<SignalStatus, SignalStatus> = {
  ACTIVE: "TP_HIT",
  TP_HIT: "ACTIVE",
  SL_HIT: "ACTIVE",
  CLOSED: "ACTIVE",
};

function AdminSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ signals: Signal[] }>("/api/signals");
      setSignals(data.signals);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(s: Signal, status: SignalStatus, returnPct?: number) {
    await api.patch(`/api/signals/${s.id}`, { status, ...(returnPct !== undefined ? { returnPct } : {}) });
    load();
  }

  async function remove(s: Signal) {
    if (!confirm(`Delete ${s.pair} signal?`)) return;
    await api.delete(`/api/signals/${s.id}`);
    load();
  }

  return (
    <section className="mx-auto max-w-[1000px] px-8 py-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Manage signals</h1>
          <p className="mt-1 text-sm text-fg/60">Changes appear immediately on the public Live Signals page.</p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-[12px] bg-gradient-to-br from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-white"
        >
          + New signal
        </Link>
      </div>

      {loading ? (
        <p className="text-fg/50">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {signals.map((s) => (
            <FlatCard key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] text-sm font-bold"
                  style={{ background: s.iconBg, color: ["#14f195", "#d4af37"].includes(s.iconBg) ? "#0b0910" : "#fff" }}
                >
                  {s.icon}
                </span>
                <div>
                  <div className="font-display text-sm font-semibold">
                    {s.pair} <span className="text-fg/40">· {s.marketLabel}</span>
                  </div>
                  <div className="text-xs text-fg/50">
                    {s.action} @ {s.entry} · conf {s.confidence}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={s.status} />
                {s.status === "ACTIVE" ? (
                  <>
                    <button
                      onClick={() => {
                        const val = prompt("Return % when TP hit (e.g. 1.5)", "1");
                        if (val !== null) setStatus(s, "TP_HIT", Number(val));
                      }}
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-success"
                    >
                      Mark TP Hit
                    </button>
                    <button
                      onClick={() => {
                        const val = prompt("Return % when SL hit (e.g. -0.5)", "-0.5");
                        if (val !== null) setStatus(s, "SL_HIT", Number(val));
                      }}
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-danger"
                    >
                      Mark SL Hit
                    </button>
                    <button
                      onClick={() => setStatus(s, "CLOSED")}
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-fg/70"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setStatus(s, NEXT_STATUS[s.status])}
                    className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-fg/70"
                  >
                    Reopen
                  </button>
                )}
                <Link
                  href={`/admin/${s.id}/edit`}
                  className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-fg/70"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(s)}
                  className="rounded-lg border border-danger/30 px-2.5 py-1.5 text-xs text-danger"
                >
                  Delete
                </button>
              </div>
            </FlatCard>
          ))}
          {signals.length === 0 && <p className="text-fg/50">No signals yet.</p>}
        </div>
      )}
    </section>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminSignals />
    </AdminGuard>
  );
}
