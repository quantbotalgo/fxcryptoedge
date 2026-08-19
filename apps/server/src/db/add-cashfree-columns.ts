// Same pattern as add-cancel-column.ts — a hand-written, minimal migration
// instead of `drizzle-kit push`, since push chokes on an unrelated pre-existing
// `id` column issue on this database. Adds the Cashfree gateway columns plus
// the `provider` enum/column so existing (Razorpay) rows keep working
// unchanged (they default to provider='RAZORPAY'). Safe to run more than once.
import { pool } from "./client.js";

async function main() {
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE payment_provider AS ENUM ('RAZORPAY', 'CASHFREE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  await pool.query(`
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider payment_provider NOT NULL DEFAULT 'RAZORPAY';
  `);
  await pool.query(`
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cashfree_order_id text;
  `);
  await pool.query(`
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cashfree_payment_id text;
  `);
  console.log("Done — provider, cashfree_order_id, cashfree_payment_id added (or already existed).");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
