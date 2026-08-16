import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    // Set by the express.json() `verify` hook in index.ts — the exact raw
    // bytes of the request body, needed for HMAC signature verification
    // (JSON.stringify(req.body) is NOT guaranteed to match Razorpay's
    // original bytes, so webhook verification must use this instead).
    rawBody?: string;
  }
}
