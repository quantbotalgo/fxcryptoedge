import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users, referrals } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { COMMISSION_TIERS, tierForPaidConversions, commissionPctForTier } from "../lib/referral.js";

export const referralsRouter = Router();

referralsRouter.get("/tiers", (_req, res) => {
  res.json({ tiers: COMMISSION_TIERS });
});

referralsRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
  if (!user) return res.status(404).json({ error: "User not found" });

  const made = await db.query.referrals.findMany({ where: eq(referrals.referrerId, user.id) });
  const signups = made.length;
  const paidConversions = made.filter((r) => r.status === "CONVERTED").length;
  const estEarnings = made.reduce((sum, r) => sum + r.commissionEarned, 0);
  const tier = tierForPaidConversions(paidConversions);

  res.json({
    referralCode: user.referralCode,
    signups,
    paidConversions,
    estEarnings,
    currentTier: tier,
    commissionPct: commissionPctForTier(tier.key),
    recentReferrals: made.slice(0, 10),
  });
});

const claimSchema = z.object({ code: z.string().min(3).max(20) });

referralsRouter.post("/claim-code", requireAuth, async (req: Request, res: Response) => {
  const parsed = claimSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const code = parsed.data.code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 3) return res.status(400).json({ error: "Code must be at least 3 characters" });

  const existing = await db.query.users.findFirst({ where: eq(users.referralCode, code) });
  if (existing && existing.id !== req.user!.sub) {
    return res.status(409).json({ error: "That referral code is already taken" });
  }

  const [updated] = await db
    .update(users)
    .set({ referralCode: code, updatedAt: new Date() })
    .where(eq(users.id, req.user!.sub))
    .returning();

  res.json({ referralCode: updated.referralCode });
});

referralsRouter.post("/random-code", requireAuth, async (req: Request, res: Response) => {
  const { generateReferralCode } = await import("../lib/referral.js");
  const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
  for (let i = 0; i < 8; i++) {
    const code = generateReferralCode(user?.name || "trader");
    const existing = await db.query.users.findFirst({ where: eq(users.referralCode, code) });
    if (!existing) {
      const [updated] = await db
        .update(users)
        .set({ referralCode: code, updatedAt: new Date() })
        .where(eq(users.id, req.user!.sub))
        .returning();
      return res.json({ referralCode: updated.referralCode });
    }
  }
  res.status(500).json({ error: "Could not generate a unique code, try again" });
});
