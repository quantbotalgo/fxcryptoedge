import Razorpay from "razorpay";
import crypto from "node:crypto";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Razorpay client is only instantiated when keys are present. Until the client
// adds real test/live keys to apps/server/.env, payment endpoints respond with
// a clear "not configured" error instead of crashing the whole server.
export const razorpay =
  keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

export function isRazorpayConfigured(): boolean {
  return razorpay !== null;
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
