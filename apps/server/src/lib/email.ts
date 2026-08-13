// Minimal Resend wrapper using plain fetch (no SDK dependency needed — Resend's
// API is a single JSON POST). Follows the same graceful-degradation pattern as
// Razorpay/Google: if no API key is configured, calls no-op instead of crashing,
// so the rest of the app keeps working while email is being set up.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Fx Crypto Edge <onboarding@resend.dev>";

export function isEmailConfigured() {
  return Boolean(RESEND_API_KEY);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${to} ("${subject}")`);
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend request failed (${res.status}): ${body}`);
  }
  return { skipped: false };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111;">Reset your password</h2>
      <p style="color: #444; font-size: 15px; line-height: 1.5;">
        We received a request to reset the password for your Fx Crypto Edge account.
        This link expires in 1 hour.
      </p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #6366f1; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">
          Reset password
        </a>
      </p>
      <p style="color: #888; font-size: 13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
  return sendEmail(to, "Reset your Fx Crypto Edge password", html);
}
