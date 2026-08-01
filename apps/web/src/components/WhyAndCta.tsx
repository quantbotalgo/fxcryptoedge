"use client";

import { FlatCard } from "./ui/Card";
import { GradientLink } from "./ui/Buttons";
import { useAuth } from "@/lib/auth-context";

const WHYS = [
  { title: "30K+ traders", desc: "Trusted by a growing community of active traders.", glyph: "◍" },
  { title: "Forex, Gold & Crypto", desc: "Signals across all major markets with high accuracy.", glyph: "↗" },
  { title: "Real-time alerts", desc: "Instant Telegram and dashboard notifications.", glyph: "⚡" },
  { title: "Verified performance", desc: "Transparent track record you can verify.", glyph: "✓" },
];

export function WhyAndCta() {
  const { user, loading } = useAuth();
  if (loading || user) return null;

  return (
    <>
      <section className="mx-auto max-w-[1180px] px-8 py-16 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-[36px]">
          Why traders love Fx Crypto Edge
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 text-left sm:grid-cols-2">
          {WHYS.map((w) => (
            <FlatCard key={w.title} className="flex gap-4 p-6">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[13px] bg-accent/[.16] text-xl text-accent-soft">
                {w.glyph}
              </span>
              <div>
                <div className="mb-1 font-display text-lg font-semibold">{w.title}</div>
                <p className="text-[14.5px] leading-snug text-fg/60">{w.desc}</p>
              </div>
            </FlatCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-8 pb-16 pt-6">
        <div
          className="rounded-[26px] border border-accent/[.28] bg-white/[.03] px-6 py-13 text-center"
          style={{
            background:
              "radial-gradient(600px 300px at 50% -60px, rgba(139,124,246,.28), transparent 70%), rgba(255,255,255,.03)",
          }}
        >
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-[38px]">
            Ready to start earning?
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-base leading-relaxed text-fg/65">
            Create your free account, claim your referral code, and share it with your network.
          </p>
          <GradientLink href="/signup" className="mt-6 shadow-[0_14px_34px_rgba(99,102,241,.38)]">
            Create free account <span>→</span>
          </GradientLink>
        </div>
      </section>
    </>
  );
}
