import { Cashfree, CFEnvironment } from "cashfree-pg";
import crypto from "node:crypto";

const appId = process.env.CASHFREE_APP_ID;
const secretKey = process.env.CASHFREE_SECRET_KEY;
// Defaults to sandbox so a half-configured env can't accidentally take live
// payments — CASHFREE_ENV must be explicitly set to "PRODUCTION" to go live.
const environment = process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

// Same "only instantiate if keys are present" pattern as lib/razorpay.ts —
// until CASHFREE_APP_ID / CASHFREE_SECRET_KEY are set, Cashfree endpoints
// respond with a clear "not configured" error instead of crashing.
export const cashfree = appId && secretKey ? new Cashfree(environment, appId, secretKey) : null;

export function isCashfreeConfigured(): boolean {
  return cashfree !== null;
}

// Cashfree's webhook signature is base64( HMAC_SHA256( timestamp + rawBody, secretKey ) )
// — timestamp and body are concatenated directly (no separator), and it must be
// computed over the exact raw request bytes, not a re-serialized JSON.stringify,
// since re-serializing can shift decimal formatting (e.g. "170.00" -> 170) and
// silently break the signature match.
export function verifyCashfreeWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
  if (!secretKey) return false;
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(timestamp + rawBody)
    .digest("base64");
  return expected === signature;
}
