export type Market = "FOREX" | "CRYPTO" | "XAUUSD";
export type SignalAction = "BUY" | "SELL";
export type SignalStatus = "ACTIVE" | "CLOSED" | "TP_HIT" | "SL_HIT";

export type Signal = {
  id: string;
  pair: string;
  market: Market;
  marketLabel: string;
  action: SignalAction;
  // Null when `locked` is true — the viewer isn't entitled to this market's
  // signal detail and the API has redacted these fields.
  entry: string | null;
  stopLoss: string | null;
  tp1: string | null;
  tp2: string | null;
  tp3: string | null;
  confidence: number;
  status: SignalStatus;
  note: string | null;
  icon: string;
  iconBg: string;
  returnPct: number | null;
  postedAt: string;
  closedAt: string | null;
  locked: boolean;
};

export type PlanTier = "BASIC" | "LITE" | "PRO";
export type BillingCycle = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export type PriceBreakdown = {
  billingCycle: BillingCycle;
  priceMonthly: number;
  strikeMonthly: number | null;
  discountLabel: string | null;
  billedTotal: number;
  billedLabel: string;
};

export type Plan = {
  id: string;
  key: string;
  name: string;
  tier: PlanTier;
  market: string;
  description: string;
  basePriceMonthly: number;
  features: string[];
  popular: boolean;
  sortOrder: number;
  pricing: PriceBreakdown;
};

export type PerformanceStats = {
  winRate: number;
  winLossLabel: string;
  cumulativeReturn: number;
  closedTrades: number;
  avgPerTrade: number;
  best: number;
  worst: number;
};

export type MarketBreakdown = {
  market: Market;
  winRate: number;
  trades: number;
  wins: number;
  losses: number;
  cumulativeReturn: number;
};

export type PerformanceResponse = {
  stats: PerformanceStats;
  byMarket: MarketBreakdown[];
  trades: Signal[];
};

export type CommissionTier = {
  key: string;
  name: string;
  pct: string;
  cap: string;
  popular: boolean;
  features: readonly string[];
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  referralCode: string | null;
};

export type ReferralMe = {
  referralCode: string | null;
  signups: number;
  paidConversions: number;
  estEarnings: number;
  currentTier: CommissionTier;
  commissionPct: number;
  recentReferrals: unknown[];
};
