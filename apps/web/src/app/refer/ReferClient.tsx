"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { FlatCard } from "@/components/ui/Card";
import { GradientLink } from "@/components/ui/Buttons";
import type { CommissionTier, ReferralMe } from "@/lib/types";

const STEPS = [
  { n: "01", title: "Get your code", desc: "Create a custom referral code in seconds." },
  { n: "02", title: "Share it", desc: "Share on socials, Telegram, YouTube, or with friends." },
  { n: "03", title: "Earn", desc: "Earn commission when referrals buy a subscription." },
];

function TierCard({ tier }: { tier: CommissionTier }) {
  return (
    <div
      className="relative rounded-[22px] p-7"
      style={{
        border: `1px solid ${tier.popular ? "rgba(139,124,246,.4)" : "rgba(255,255,255,.08)"}`,
        background: tier.popular
          ? "linear-gradient(140deg, rgba(139,124,246,.16), rgba(99,102,241,.05))"
          : "rgba(255,255,255,.03)",
      }}
    >
      {tier.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-accent to-accent-2 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-white">
          MOST POPULAR
        </span>
      )}
      <div className="font-mono text-[11px] tracking-[.14em] text-fg/50">{tier.name}</div>
      <div className="text-gradient-tier my-2 font-display text-[42px] font-bold tracking-tight sm:text-[48px]">
        {tier.pct}
      </div>
      <div className="mb-[18px] text-[13.5px] text-fg/55">{tier.cap}</div>
      <div className="flex flex-col gap-2.5">
        {tier.features.map((f) => (
          <div key={f} className="flex items-center gap-2.5 text-sm text-fg/80">
            <span className="text-success">✓</span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReferClient({ tiers }: { tiers: CommissionTier[] }) {
  const { user } = useAuth();
  const [me, setMe] = useState<ReferralMe | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get<ReferralMe>("/api/referrals/me").then(setMe).catch(() => setMe(null));
  }, [user]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareLink = me?.referralCode ? `${origin}/signup?ref=${me.referralCode}` : "";

  async function copyLink() {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function claimCode() {
    if (!codeInput.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await api.post<{ referralCode: string }>("/api/referrals/claim-code", {
        code: codeInput,
      });
      setMe((prev) => (prev ? { ...prev, referralCode: res.referralCode } : prev));
      setMsg("Referral code claimed!");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not claim that code");
    } finally {
      setBusy(false);
    }
  }

  async function randomCode() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await api.post<{ referralCode: string }>("/api/referrals/random-code");
      setMe((prev) => (prev ? { ...prev, referralCode: res.referralCode } : prev));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not generate a code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1180px] px-5 sm:px-8 pb-5 pt-14">
      <div
        className="rounded-[24px] border border-white/[.08] px-6 py-11 text-center"
        style={{ background: "linear-gradient(150deg, rgba(139,124,246,.14), rgba(255,255,255,.02))" }}
      >
        <div className="font-mono text-xs uppercase tracking-[.22em] text-accent">
          Influencers &amp; Affiliates
        </div>
        <h1 className="mt-3 mb-2.5 font-display text-[32px] font-bold tracking-tight sm:text-[44px]">
          {user ? "Refer & Earn" : "Earn with our referral program"}
        </h1>
        <p className="mx-auto mb-5 max-w-[620px] text-base leading-relaxed text-fg/62">
          Get your unique referral link, share it with your audience, and earn commission on every
          paid subscription. Influencers get higher payouts and a custom code.
        </p>
        {!user && (
          <GradientLink href="/signup">Join the referral program</GradientLink>
        )}
      </div>

      {user && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FlatCard className="p-5">
              <div className="font-mono text-[11px] tracking-[.1em] text-fg/50">SIGNUPS</div>
              <div className="mt-2 font-display text-[28px] font-bold">{me?.signups ?? 0}</div>
            </FlatCard>
            <FlatCard className="p-5">
              <div className="font-mono text-[11px] tracking-[.1em] text-fg/50">PAID CONVERSIONS</div>
              <div className="mt-2 font-display text-[28px] font-bold">{me?.paidConversions ?? 0}</div>
            </FlatCard>
            <FlatCard className="p-5">
              <div className="font-mono text-[11px] tracking-[.1em] text-fg/50">EST. EARNINGS</div>
              <div className="mt-2 font-display text-[28px] font-bold">
                ₹{(me?.estEarnings ?? 0).toLocaleString("en-IN")}
              </div>
            </FlatCard>
          </div>

          <FlatCard className="mt-5 p-6">
            <div className="mb-1 font-display text-lg font-semibold">Your referral link</div>
            <p className="mb-3 text-sm text-fg/60">Pick a custom code or generate one automatically.</p>
            {me?.referralCode && (
              <>
                <p className="mb-3 text-sm text-fg/75">
                  Current code: <span className="font-mono font-semibold text-accent-soft">{me.referralCode}</span>
                </p>
                <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    readOnly
                    value={shareLink}
                    onClick={(e) => e.currentTarget.select()}
                    className="flex-1 rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 font-mono text-sm text-fg/70 outline-none"
                  />
                  <button
                    onClick={copyLink}
                    className="rounded-[12px] border border-white/[.16] bg-white/[.03] px-5 py-3 text-sm font-semibold whitespace-nowrap"
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </>
            )}
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. TRADER10"
                className="flex-1 rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 font-mono text-sm outline-none focus:border-accent"
              />
              <button
                onClick={claimCode}
                disabled={busy}
                className="rounded-[12px] bg-gradient-to-br from-accent to-accent-2 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Claim code
              </button>
              <button
                onClick={randomCode}
                disabled={busy}
                className="rounded-[12px] border border-white/[.16] bg-white/[.03] px-5 py-3 text-sm font-semibold disabled:opacity-60"
              >
                Random
              </button>
            </div>
            {msg && <p className="mt-2 text-xs text-fg/60">{msg}</p>}
          </FlatCard>
        </>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STEPS.map((s) => (
          <FlatCard key={s.n} className="p-6">
            <div className="font-display text-[26px] font-bold text-accent/60">{s.n}</div>
            <div className="my-1.5 font-display text-lg font-semibold">{s.title}</div>
            <p className="text-sm leading-snug text-fg/60">{s.desc}</p>
          </FlatCard>
        ))}
      </div>

      <div className="mb-6 mt-13 text-center">
        <h2 className="font-display text-[28px] font-bold tracking-tight sm:text-[34px]">
          Commission tiers
        </h2>
        <p className="mt-2.5 text-[15px] text-fg/60">
          The more you refer, the more you earn. Commission applies to every paid subscription.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.key} tier={t} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-fg/55">
        Have a large audience? Email{" "}
        <a href="mailto:partners@fxcryptoedge.in">partners@fxcryptoedge.in</a> for custom rates.
      </p>
    </section>
  );
}
