"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { FlatCard } from "@/components/ui/Card";
import { api } from "@/lib/api";
import type { Signal, MySubscription } from "@/lib/types";

function formatExpiry(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function YourPlanCard() {
  const [subs, setSubs] = useState<MySubscription[] | null>(null);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function load() {
    api
      .get<{ subscriptions: MySubscription[] }>("/api/payments/me")
      .then((data) => setSubs(data.subscriptions))
      .catch(() => setSubs([]));
  }

  useEffect(load, []);

  async function cancel(id: string) {
    setCanceling(id);
    try {
      await api.post("/api/payments/cancel", { subscriptionId: id });
      load();
    } catch {
      // leave the list as-is; the button reverting to normal is signal enough
    } finally {
      setCanceling(null);
      setConfirmId(null);
    }
  }

  return (
    <FlatCard className="p-5">
      <div className="mb-1 font-display text-lg font-semibold">Your plan{subs && subs.length > 1 ? "s" : ""}</div>
      {subs === null ? (
        <p className="mb-3 text-sm text-fg/60">Loading…</p>
      ) : subs.length === 0 ? (
        <p className="mb-3 text-sm text-fg/60">You don&apos;t have an active subscription yet.</p>
      ) : (
        <div className="mb-3 flex flex-col gap-3">
          {subs.map((s) => (
            <div key={s.id} className="border-b border-white/[.06] pb-3 last:border-0 last:pb-0">
              <p className="text-sm text-fg/60">
                <span className="font-semibold text-fg/85">
                  {s.plan.name} · {s.plan.market}
                </span>
                {s.expiresAt && (
                  <> — {s.canceledAt ? "cancels" : "renews"} {formatExpiry(s.expiresAt)}</>
                )}
              </p>
              {!s.canceledAt &&
                (confirmId === s.id ? (
                  <div className="mt-1.5 flex items-center gap-3 text-xs">
                    <span className="text-fg/55">Cancel this plan?</span>
                    <button
                      onClick={() => cancel(s.id)}
                      disabled={canceling === s.id}
                      className="font-semibold text-danger disabled:opacity-60"
                    >
                      {canceling === s.id ? "Canceling…" : "Yes, cancel"}
                    </button>
                    <button onClick={() => setConfirmId(null)} className="font-semibold text-fg/55">
                      Never mind
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(s.id)}
                    className="mt-1 text-xs font-semibold text-fg/45 hover:text-danger"
                  >
                    Cancel subscription
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
      <Link href="/pricing" className="text-sm font-semibold text-accent-soft">
        {subs && subs.length > 0 ? "View plans →" : "Get a plan →"}
      </Link>
    </FlatCard>
  );
}

function AdminDashboard({ name }: { name: string }) {
  const [signals, setSignals] = useState<Signal[] | null>(null);

  useEffect(() => {
    api
      .get<{ signals: Signal[] }>("/api/signals")
      .then((data) => setSignals(data.signals))
      .catch(() => setSignals([]));
  }, []);

  const total = signals?.length ?? null;
  const active = signals?.filter((s) => s.status === "ACTIVE").length ?? null;

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <FlatCard className="p-5">
          <div className="font-mono text-[11px] tracking-[.1em] text-fg/50">TOTAL SIGNALS</div>
          <div className="mt-2 font-display text-[28px] font-bold">{total ?? "—"}</div>
        </FlatCard>
        <FlatCard className="p-5">
          <div className="font-mono text-[11px] tracking-[.1em] text-fg/50">ACTIVE NOW</div>
          <div className="mt-2 font-display text-[28px] font-bold text-accent-soft">{active ?? "—"}</div>
        </FlatCard>
      </div>
      <FlatCard className="p-5">
        <div className="mb-1 font-display text-lg font-semibold">Admin</div>
        <p className="mb-3 text-sm text-fg/60">Post and manage live trading signals for {name}&apos;s desk.</p>
        <Link href="/admin" className="text-sm font-semibold text-accent-soft">
          Open admin panel →
        </Link>
      </FlatCard>
    </>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/dashboard");
  }, [loading, user, router]);

  if (loading || !user) {
    return <section className="mx-auto max-w-[720px] px-5 sm:px-8 py-20 text-center text-fg/50">Loading…</section>;
  }

  return (
    <section className="mx-auto max-w-[720px] px-5 sm:px-8 py-16">
      <h1 className="mb-1 font-display text-3xl font-bold tracking-tight">Welcome, {user.name.split(" ")[0]}</h1>
      <p className="mb-8 text-sm text-fg/60">{user.email}</p>

      {user.role === "ADMIN" ? (
        <AdminDashboard name="Fx Crypto Edge" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <YourPlanCard />
          <FlatCard className="p-5">
            <div className="mb-1 font-display text-lg font-semibold">Referral program</div>
            <p className="mb-3 text-sm text-fg/60">
              Your code: <span className="font-mono text-accent-soft">{user.referralCode}</span>
            </p>
            <Link href="/refer" className="text-sm font-semibold text-accent-soft">
              Manage referrals →
            </Link>
          </FlatCard>
        </div>
      )}
    </section>
  );
}
