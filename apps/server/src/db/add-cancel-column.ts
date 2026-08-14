// Same pattern as add-reset-columns.ts — a hand-written, minimal migration
// instead of `drizzle-kit push`, since push tried to touch an unrelated `id`
// column on this database and got rejected by Postgres. This only adds one
// nullable column, so it can't touch anything else. Safe to run more than
// once (IF NOT EXISTS).
import { pool } from "./client.js";

async function main() {
  await pool.query(`
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS canceled_at timestamp;
  `);
  console.log("Done — canceled_at added (or already existed).");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
