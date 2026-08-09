import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// drizzle-kit uses its own connection (separate from the app's pg Pool in
// db/client.ts), so it needs SSL configured independently for Render's
// managed Postgres — same reasoning as client.ts.
const rawUrl = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(rawUrl);
const url = isLocalDb
  ? rawUrl
  : rawUrl + (rawUrl.includes("?") ? "&" : "?") + "sslmode=require";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
