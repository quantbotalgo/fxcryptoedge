import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, pool } from "./client.js";
import { users, signals, plans } from "./schema.js";
import { generateReferralCode } from "../lib/referral.js";

async function main() {
  console.log("Seeding Fx Crypto Edge database...");

  const adminEmail = "admin@fxcryptoedge.in";
  const adminPassword = "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      referralCode: generateReferralCode("ADMIN"),
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  const adminId = admin?.id;

  await db.delete(signals);
  await db.insert(signals).values([
    // ---- Crypto ----
    {
      pair: "BTC/USDT", market: "CRYPTO", marketLabel: "CRYPTO", action: "BUY",
      entry: "96,400", stopLoss: "94,800", tp1: "98,000", tp2: "100,000", tp3: "102,500",
      confidence: 87, status: "ACTIVE", note: "Reclaim of 96k. ETF flows positive.",
      icon: "₿", iconBg: "#f7931a", createdById: adminId,
    },
    {
      pair: "ETH/USDT", market: "CRYPTO", marketLabel: "CRYPTO", action: "BUY",
      entry: "3,380", stopLoss: "3,290", tp1: "3,480", tp2: "3,580", tp3: "3,700",
      confidence: 83, status: "TP_HIT", note: "TP1 hit on ETH strength vs BTC.",
      icon: "Ξ", iconBg: "#627eea", returnPct: 2.96, createdById: adminId,
    },
    {
      pair: "SOL/USDT", market: "CRYPTO", marketLabel: "CRYPTO", action: "SELL",
      entry: "218.5", stopLoss: "225", tp1: "212", tp2: "205",
      confidence: 76, status: "ACTIVE", note: "Overextended — expecting pullback to 210.",
      icon: "◎", iconBg: "#14f195", createdById: adminId,
    },
    {
      pair: "XRP/USDT", market: "CRYPTO", marketLabel: "CRYPTO", action: "BUY",
      entry: "2.42", stopLoss: "2.28", tp1: "2.55", tp2: "2.70", tp3: "2.85",
      confidence: 79, status: "CLOSED", note: "Closed for the weekend.",
      icon: "✕", iconBg: "#23292f", createdById: adminId,
    },
    // ---- Gold / XAUUSD ----
    {
      pair: "XAU/USD", market: "XAUUSD", marketLabel: "GOLD", action: "BUY",
      entry: "2,648.5", stopLoss: "2,632", tp1: "2,665", tp2: "2,680", tp3: "2,700",
      confidence: 88, status: "ACTIVE", note: "Bullish above the 2,640 pivot. DXY softening.",
      icon: "Au", iconBg: "#d4af37", createdById: adminId,
    },
    {
      pair: "XAU/USD", market: "XAUUSD", marketLabel: "GOLD", action: "SELL",
      entry: "2,672.3", stopLoss: "2,680", tp1: "2,658", tp2: "2,650",
      confidence: 82, status: "TP_HIT", note: "Rejection at resistance. TP1 hit cleanly.",
      icon: "Au", iconBg: "#d4af37", returnPct: 0.27, createdById: adminId,
    },
    {
      pair: "XAU/USD", market: "XAUUSD", marketLabel: "GOLD", action: "BUY",
      entry: "2,635", stopLoss: "2,628", tp1: "2,642", tp2: "2,650",
      confidence: 75, status: "SL_HIT", note: "Failed breakout — SL triggered on NFP spike.",
      icon: "Au", iconBg: "#d4af37", returnPct: -0.27, createdById: adminId,
    },
    {
      pair: "XAU/USD", market: "XAUUSD", marketLabel: "GOLD", action: "BUY",
      entry: "2,620", stopLoss: "2,612", tp1: "2,638", tp2: "2,650",
      confidence: 90, status: "CLOSED", note: "Closed manually before FOMC.",
      icon: "Au", iconBg: "#d4af37", returnPct: 0.41, createdById: adminId,
    },
    // ---- Forex ----
    {
      pair: "GBP/USD", market: "FOREX", marketLabel: "FOREX", action: "BUY",
      entry: "1.262", stopLoss: "1.2585", tp1: "1.266", tp2: "1.27",
      confidence: 78, status: "TP_HIT", note: "TP1 hit on UK CPI beat.",
      icon: "£", iconBg: "#2563eb", returnPct: 0.32, createdById: adminId,
    },
    {
      pair: "USD/JPY", market: "FOREX", marketLabel: "FOREX", action: "BUY",
      entry: "154.2", stopLoss: "153.4", tp1: "155.0", tp2: "155.8",
      confidence: 85, status: "ACTIVE", note: "Carry bid intact above 154.",
      icon: "¥", iconBg: "#dc2626", createdById: adminId,
    },
    {
      pair: "AUD/USD", market: "FOREX", marketLabel: "FOREX", action: "SELL",
      entry: "0.651", stopLoss: "0.658", tp1: "0.644",
      confidence: 72, status: "SL_HIT", note: "Failed breakout — SL triggered on NFP spike.",
      icon: "A$", iconBg: "#0ea5e9", returnPct: -0.46, createdById: adminId,
    },
    {
      pair: "EUR/USD", market: "FOREX", marketLabel: "FOREX", action: "SELL",
      entry: "1.0485", stopLoss: "1.051", tp1: "1.046", tp2: "1.0435", tp3: "1.041",
      confidence: 80, status: "ACTIVE", note: "ECB dovish tone. Short bias continues.",
      icon: "€", iconBg: "#1d4ed8", createdById: adminId,
    },
    {
      pair: "EUR/USD", market: "FOREX", marketLabel: "FOREX", action: "BUY",
      entry: "1.084", stopLoss: "1.078", tp1: "1.090",
      confidence: 77, status: "CLOSED", note: "Broke above 1.08 resistance. Booked partial.",
      icon: "€", iconBg: "#1d4ed8", returnPct: 0.18, createdById: adminId,
    },
  ]);

  await db.delete(plans);
  await db.insert(plans).values([
    {
      key: "basic_forex", name: "Basic", tier: "BASIC", market: "FOREX", markets: ["FOREX"],
      description: "Daily forex calls for new traders.", basePriceMonthly: 999, sortOrder: 1,
      features: ["3–5 forex signals / day", "Entry, SL & TP levels", "Web access", "Risk management notes"],
    },
    {
      key: "basic_gold", name: "Basic", tier: "BASIC", market: "GOLD / XAUUSD", markets: ["XAUUSD"],
      description: "Focused gold (XAUUSD) signals.", basePriceMonthly: 1199, sortOrder: 2,
      features: ["3–5 gold signals / day", "Intraday + swing setups", "Web access", "Risk management notes"],
    },
    {
      key: "basic_crypto", name: "Basic", tier: "BASIC", market: "CRYPTO", markets: ["CRYPTO"],
      description: "Spot & futures crypto calls.", basePriceMonthly: 959, sortOrder: 3,
      features: ["3–5 crypto signals / day", "Spot + futures setups", "Web access", "Risk management notes"],
    },
    {
      key: "lite_forex_gold", name: "Lite", tier: "LITE", market: "FOREX + GOLD", markets: ["FOREX", "XAUUSD"],
      description: "Two markets in one plan.", basePriceMonthly: 1699, sortOrder: 4,
      features: ["5–8 signals / day", "Forex + Gold coverage", "Telegram alerts", "Risk management notes"],
    },
    {
      key: "lite_gold_crypto", name: "Lite", tier: "LITE", market: "GOLD + CRYPTO", markets: ["XAUUSD", "CRYPTO"],
      description: "Two markets in one plan.", basePriceMonthly: 1799, sortOrder: 5,
      features: ["5–8 signals / day", "Gold + Crypto coverage", "Telegram alerts", "Risk management notes"],
    },
    {
      key: "pro_all", name: "Pro", tier: "PRO", market: "FOREX + GOLD + CRYPTO",
      markets: ["FOREX", "XAUUSD", "CRYPTO"],
      description: "Everything we trade, all in one plan.", basePriceMonthly: 2499, sortOrder: 6, popular: true,
      features: [
        "8–12 signals / day",
        "Forex + Gold + Crypto",
        "Telegram + WhatsApp alerts",
        "Priority TP/SL updates",
        "Weekly market briefings",
      ],
    },
  ]);

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword} (change this password!)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
