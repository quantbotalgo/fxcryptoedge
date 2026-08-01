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

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
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
