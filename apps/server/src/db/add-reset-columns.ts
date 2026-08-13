// One-off, hand-written migration for the forgot-password feature. Written as
// plain SQL instead of `drizzle-kit push` because push does a full live-schema
// diff and, on this database, tried to also touch an unrelated `id` column
// (rejected by Postgres since `id` is a primary key) — so push was aborted
// before applying anything. This script only adds the two new nullable
// columns and nothing else, so it can't touch the primary key or any other
// table. Safe to run more than once (IF NOT EXISTS).
import { pool } from "./client.js";

async function main() {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_hash text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires timestamp;
  `);
  console.log("Done — password_reset_token_hash / password_reset_expires added (or already existed).");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
