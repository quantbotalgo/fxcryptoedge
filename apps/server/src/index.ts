import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRouter } from "./routes/auth.routes.js";
import { signalsRouter } from "./routes/signals.routes.js";
import { performanceRouter } from "./routes/performance.routes.js";
import { plansRouter } from "./routes/plans.routes.js";
import { referralsRouter } from "./routes/referrals.routes.js";
import { paymentsRouter } from "./routes/payments.routes.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// CLIENT_ORIGIN may be a single URL or a comma-separated list (e.g. both the
// apex and "www" versions of a custom domain, since a browser sees those as
// two different origins even though they resolve to the "same site" to a
// human — Vercel's apex->www redirect means the page can actually be served
// from either one depending on how the visitor typed the URL).
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests (curl, server-to-server, no Origin header) are fine.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(
  express.json({
    // Capture the exact raw bytes alongside the parsed body — needed for the
    // Razorpay webhook's HMAC signature check, which must be computed over
    // the original bytes, not a re-serialized JSON.stringify(req.body) (key
    // order/whitespace differences would make every signature check fail).
    verify: (req, _res, buf) => {
      // body-parser types `req` as plain http.IncomingMessage here, not the
      // Express Request our declaration-merged `rawBody` field lives on.
      (req as express.Request).rawBody = buf.toString("utf8");
    },
  })
);
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/signals", signalsRouter);
app.use("/api/performance", performanceRouter);
app.use("/api/plans", plansRouter);
app.use("/api/referrals", referralsRouter);
app.use("/api/payments", paymentsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Fx Crypto Edge API listening on http://localhost:${PORT}`);
});
