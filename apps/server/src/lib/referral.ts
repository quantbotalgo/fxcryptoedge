// Referral commission tiers — ported 1:1 from the client's design prototype.
export const COMMISSION_TIERS = [
  {
    key: "STARTER",
    name: "STARTER",
    pct: "20%",
    cap: "Up to 10 paid referrals / month",
    popular: false,
    features: ["Custom referral code", "Real-time dashboard", "Monthly payouts"],
  },
  {
    key: "CREATOR",
    name: "CREATOR",
    pct: "30%",
    cap: "11–50 paid referrals / month",
    popular: true,
    features: ["Everything in Starter", "Priority support", "Early access to features"],
  },
  {
    key: "INFLUENCER",
    name: "INFLUENCER",
    pct: "40%+",
    cap: "50+ paid referrals · custom deal",
    popular: false,
    features: [
      "Everything in Creator",
      "Custom payout terms",
      "Co-marketing opportunities",
      "Dedicated partner manager",
    ],
  },
] as const;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(seedName?: string): string {
  const base = (seedName || "TRADER")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6) || "TRADER";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${base}${suffix}`;
}

export function tierForPaidConversions(count: number) {
  if (count >= 50) return COMMISSION_TIERS[2];
  if (count >= 11) return COMMISSION_TIERS[1];
  return COMMISSION_TIERS[0];
}

export function commissionPctForTier(tierKey: string): number {
  if (tierKey === "INFLUENCER") return 0.4;
  if (tierKey === "CREATOR") return 0.3;
  return 0.2;
}
