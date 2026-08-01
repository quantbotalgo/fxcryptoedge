import { GradientLink, OutlineLink } from "@/components/ui/Buttons";
import { Card } from "@/components/ui/Card";
import { SectionLabel, Pill } from "@/components/ui/Misc";
import { WhyAndCta } from "@/components/WhyAndCta";

const TICKER = [
  { sym: "XAU/USD", chg: "+0.21%", up: true },
  { sym: "BTC/USDT", chg: "+1.87%", up: true },
  { sym: "GBP/JPY", chg: "-0.33%", up: false },
  { sym: "ETH/USDT", chg: "+1.12%", up: true },
  { sym: "EUR/USD", chg: "+0.15%", up: true },
  { sym: "SOL/USDT", chg: "-0.88%", up: false },
  { sym: "USD/INR", chg: "+0.42%", up: true },
];
const TICKER_LOOP = [...TICKER, ...TICKER];

const AVATARS = [
  { ch: "A", bg: "#f59e0b" },
  { ch: "B", bg: "#ef4444" },
  { ch: "C", bg: "#8b5cf6" },
  { ch: "D", bg: "#06b6d4" },
  { ch: "E", bg: "#10b981" },
];

const MARKETS = [
  { tag: "FOREX", name: "Major & minor pairs", desc: "EUR/USD, GBP/USD, USD/JPY and more — precise intraday and swing calls." },
  { tag: "GOLD", name: "XAU/USD", desc: "A dedicated gold desk with intraday scalps and multi-day swing setups." },
  { tag: "CRYPTO", name: "BTC, ETH & top alts", desc: "Spot and futures calls on the most liquid crypto markets, 24×5." },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-[900px] px-8 pb-5 pt-[78px] text-center">
        <Pill className="mx-auto">
          <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-success" />
          Live signals · Markets open
        </Pill>
        <h1 className="mt-6 font-display text-[42px] font-bold leading-[1.05] tracking-tight sm:text-[56px] lg:text-[64px]">
          Trading signals for
          <br />
          <span className="text-gradient">Forex, Crypto &amp; Gold.</span>
        </h1>
        <div className="mt-3.5 font-display text-xl font-semibold tracking-tight text-accent">
          Built for India.
        </div>
        <p className="mx-auto mt-5 max-w-[640px] text-[17.5px] leading-relaxed text-fg/62">
          Get real-time BUY/SELL alerts with precise entries, stop loss and multiple take-profits —
          for XAU/USD, major forex pairs, and top crypto. Priced in ₹ for Indian traders.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <GradientLink href="/signup">
            Start free <span>→</span>
          </GradientLink>
          <OutlineLink href="/signals">View live signals</OutlineLink>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-6 text-[13.5px] text-fg/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-accent">✓</span>Transparent track record
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-accent">✦</span>Instant Telegram/WhatsApp alerts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-accent">◷</span>Updated 24×5
          </span>
        </div>
        <Pill className="mt-6 mx-auto border-accent/30 bg-accent/[.08]">
          <span className="text-accent">★</span>Powered by Claude AI
        </Pill>
      </section>

      <div className="relative mt-9 overflow-hidden border-y border-white/[.06] py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-ticker gap-11">
          {TICKER_LOOP.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-sm">
              <span className="text-fg/85">{t.sym}</span>
              <span className={`font-medium ${t.up ? "text-success" : "text-danger"}`}>{t.chg}</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1180px] px-8 pb-2 pt-9">
        <div className="flex flex-wrap items-center justify-center gap-5 rounded-[18px] border border-white/[.08] bg-white/[.03] px-6 py-[18px]">
          <div className="flex items-center">
            {AVATARS.map((a, i) => (
              <span
                key={i}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 text-[13px] font-bold"
                style={{ background: a.bg, marginLeft: i === 0 ? 0 : -9, borderColor: "#0d0b16", color: "#0b0910" }}
              >
                {a.ch}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-2 text-[15px] text-fg/85">
            <span className="text-accent">◈</span>Trusted by <strong className="text-white">30,000+</strong>{" "}
            traders across India
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-fg/70">
            <span className="h-[7px] w-[7px] rounded-full bg-success" />
            4.9/5 rating
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-8 pb-5 pt-14 text-center">
        <SectionLabel>Markets we cover</SectionLabel>
        <h2 className="mt-3 mb-8 font-display text-[32px] font-bold tracking-tight sm:text-[40px]">
          Three markets. One desk.
        </h2>
        <div className="grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
          {MARKETS.map((m) => (
            <Card key={m.tag} className="p-[26px]">
              <div className="font-mono text-[11px] tracking-[.16em] text-accent">{m.tag}</div>
              <div className="my-2.5 font-display text-[22px] font-semibold">{m.name}</div>
              <p className="text-[14.5px] leading-relaxed text-fg/60">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <WhyAndCta />
    </div>
  );
}
