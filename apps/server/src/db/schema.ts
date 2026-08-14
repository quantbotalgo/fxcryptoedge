// Fx Crypto Edge — Drizzle ORM schema (Postgres)
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const marketEnum = pgEnum("market", ["FOREX", "CRYPTO", "XAUUSD"]);
export const signalActionEnum = pgEnum("signal_action", ["BUY", "SELL"]);
export const signalStatusEnum = pgEnum("signal_status", [
  "ACTIVE",
  "CLOSED",
  "TP_HIT",
  "SL_HIT",
]);
export const planTierEnum = pgEnum("plan_tier", ["BASIC", "LITE", "PRO"]);
export const billingCycleEnum = pgEnum("billing_cycle", [
  "MONTHLY",
  "QUARTERLY",
  "ANNUAL",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "PENDING",
  "ACTIVE",
  "CANCELED",
  "EXPIRED",
]);
export const referralStatusEnum = pgEnum("referral_status", [
  "SIGNED_UP",
  "CONVERTED",
]);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    googleId: text("google_id"),
    name: text("name").notNull(),
    role: roleEnum("role").notNull().default("USER"),
    referralCode: text("referral_code"),
    passwordResetTokenHash: text("password_reset_token_hash"),
    passwordResetExpires: timestamp("password_reset_expires"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_google_id_idx").on(t.googleId),
    uniqueIndex("users_referral_code_idx").on(t.referralCode),
  ]
);

export const signals = pgTable(
  "signals",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    pair: text("pair").notNull(),
    market: marketEnum("market").notNull(),
    marketLabel: text("market_label").notNull(),
    action: signalActionEnum("action").notNull(),
    entry: text("entry").notNull(),
    stopLoss: text("stop_loss").notNull(),
    tp1: text("tp1").notNull(),
    tp2: text("tp2"),
    tp3: text("tp3"),
    confidence: integer("confidence").notNull(),
    status: signalStatusEnum("status").notNull().default("ACTIVE"),
    note: text("note").notNull(),
    icon: text("icon").notNull(),
    iconBg: text("icon_bg").notNull(),
    returnPct: doublePrecision("return_pct"),
    postedAt: timestamp("posted_at").notNull().defaultNow(),
    closedAt: timestamp("closed_at"),
    createdById: text("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("signals_market_idx").on(t.market), index("signals_status_idx").on(t.status)]
);

export const plans = pgTable(
  "plans",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    key: text("key").notNull(),
    name: text("name").notNull(),
    tier: planTierEnum("tier").notNull(),
    market: text("market").notNull(),
    // Structured entitlements used for paywall checks (the `market` field above is
    // just the display label, e.g. "GOLD / XAUUSD" or "FOREX + GOLD + CRYPTO").
    markets: jsonb("markets").$type<("FOREX" | "CRYPTO" | "XAUUSD")[]>(),
    description: text("description").notNull(),
    basePriceMonthly: integer("base_price_monthly").notNull(),
    features: jsonb("features").notNull().$type<string[]>(),
    popular: boolean("popular").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("plans_key_idx").on(t.key)]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    billingCycle: billingCycleEnum("billing_cycle").notNull().default("MONTHLY"),
    status: subscriptionStatusEnum("status").notNull().default("PENDING"),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpaySubscriptionId: text("razorpay_subscription_id"),
    amount: integer("amount").notNull(),
    startedAt: timestamp("started_at"),
    expiresAt: timestamp("expires_at"),
    // Set when the user cancels — subscription stays ACTIVE (and entitled)
    // until expiresAt, it just won't renew. Kept separate from `status` so
    // cancellation doesn't immediately cut off access they already paid for.
    canceledAt: timestamp("canceled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("subscriptions_user_idx").on(t.userId), index("subscriptions_status_idx").on(t.status)]
);

export const referrals = pgTable(
  "referrals",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    referrerId: text("referrer_id")
      .notNull()
      .references(() => users.id),
    referredUserId: text("referred_user_id").references(() => users.id),
    code: text("code").notNull(),
    status: referralStatusEnum("status").notNull().default("SIGNED_UP"),
    commissionEarned: integer("commission_earned").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("referrals_referrer_idx").on(t.referrerId),
    uniqueIndex("referrals_referred_user_idx").on(t.referredUserId),
  ]
);

// ---- Relations ----

export const usersRelations = relations(users, ({ many, one }) => ({
  signalsPosted: many(signals),
  subscriptions: many(subscriptions),
  referralsMade: many(referrals, { relationName: "referralsMade" }),
  referralJoin: one(referrals, {
    fields: [users.id],
    references: [referrals.referredUserId],
    relationName: "referralJoin",
  }),
}));

export const signalsRelations = relations(signals, ({ one }) => ({
  createdBy: one(users, { fields: [signals.createdById], references: [users.id] }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referralsMade",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referralJoin",
  }),
}));
