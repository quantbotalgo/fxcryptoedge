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

  useEffect(() => {
    api
      .get<{ subscriptions: MySubscription[] }>("/api/payments/me")
      .then((data) => setSubs(data.subscriptions))
      .catch(() => setSubs([]));
  }, []);

  const active = subs?.[0];

  return (
    <FlatCard className="p-5">
      <div className="mb-1 font-display text-lg font-semibold">Your plan</div>
      {subs === null ? (
        <p className="mb-3 text-sm text-fg/60">Loading…</p>
      ) : active ? (
        <p className="mb-3 text-sm text-fg/60">
          <span className="font-semibold text-fg/85">
            {active.plan.name} · {active.plan.market}
          </span>
          {active.expiresAt && <> — renews {formatExpiry(active.expiresAt)}</>}
        </p>
      ) : (
        <p className="mb-3 text-sm text-fg/60">You don&apos;t have an active subscription yet.</p>
      )}
      <Link href="/pricing" className="text-sm font-semibold text-accent-soft">
        {active ? "Manage plan →" : "View plans →"}
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
    return <section className="mx-auto max-w-[720px] px-8 py-20 text-center text-fg/50">Loading…</section>;
  }

  return (
    <section className="mx-auto max-w-[720px] px-8 py-16">
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
