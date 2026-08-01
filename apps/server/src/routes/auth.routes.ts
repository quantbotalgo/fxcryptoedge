import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users, referrals } from "../db/schema.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { generateReferralCode } from "../lib/referral.js";

export const authRouter = Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In production the frontend (Vercel) and API (Render) live on different
// domains, so the auth cookie has to be sent cross-site on every fetch() the
// browser makes. That requires SameSite=None, which in turn requires Secure
// (browsers reject None cookies without it). Locally, frontend/API share the
// "localhost" site (just different ports), so Lax works and doesn't need HTTPS.
const isProd = process.env.NODE_ENV === "production";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicUser(u: typeof users.$inferSelect) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, referralCode: u.referralCode };
}

async function uniqueReferralCode(seed: string): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateReferralCode(seed);
    const existing = await db.query.users.findFirst({ where: eq(users.referralCode, code) });
    if (!existing) return code;
  }
  return generateReferralCode(seed) + Date.now().toString(36).toUpperCase();
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  referredByCode: z.string().optional(),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { name, email, password, referredByCode } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const referralCode = await uniqueReferralCode(name);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, referralCode })
    .returning();

  if (referredByCode) {
    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, referredByCode.toUpperCase()),
    });
    if (referrer && referrer.id !== user.id) {
      await db.insert(referrals).values({
        referrerId: referrer.id,
        referredUserId: user.id,
        code: referredByCode.toUpperCase(),
        status: "SIGNED_UP",
      });
    }
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.cookie("token", token, COOKIE_OPTS);
  res.status(201).json({ user: publicUser(user), token });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.cookie("token", token, COOKIE_OPTS);
  res.json({ user: publicUser(user), token });
});

// Frontend uses Google Identity Services to get an ID token, then posts it here.
const googleSchema = z.object({ idToken: z.string() });

authRouter.post("/google", async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ error: "Google login is not configured on this server yet" });
  }
  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Missing Google ID token" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(401).json({ error: "Google token had no email" });

    let user = await db.query.users.findFirst({ where: eq(users.email, payload.email) });
    if (!user) {
      const referralCode = await uniqueReferralCode(payload.name || "trader");
      [user] = await db
        .insert(users)
        .values({
          name: payload.name || payload.email.split("@")[0],
          email: payload.email,
          googleId: payload.sub,
          referralCode,
        })
        .returning();
    } else if (!user.googleId) {
      [user] = await db
        .update(users)
        .set({ googleId: payload.sub })
        .where(eq(users.id, user.id))
        .returning();
    }

    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    res.cookie("token", token, COOKIE_OPTS);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    res.status(401).json({ error: "Invalid Google token" });
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: COOKIE_OPTS.sameSite, secure: COOKIE_OPTS.secure });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});
