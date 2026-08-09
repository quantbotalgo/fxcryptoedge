import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

// Render's managed Postgres requires SSL for any connection made from outside
// its own network (e.g. from a developer's machine using the External
// Database URL). The internal URL Render gives the API service itself is on
// a private network and doesn't need it. Local Postgres (Homebrew/Docker on
// localhost) has no SSL set up at all, so only enable it for non-local hosts.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
