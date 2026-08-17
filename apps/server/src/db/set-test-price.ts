// Temporary helper for testing a real payment end-to-end without spending a
// real amount. Sets the first plan's (key: "basic_forex") price to ₹1.
// ORIGINAL VALUE WAS 999 — run this again with REVERT=1 to put it back, or
// just re-run `npm run db:seed` if that's easier (it resets all plans/signals
// to the seed defaults, not just this one).
import { eq } from "drizzle-orm";
import { db, pool } from "./client.js";
import { plans } from "./schema.js";

const REVERT = process.env.REVERT === "1";
const ORIGINAL_PRICE = 999;
const TEST_PRICE = 1;

async function main() {
  const price = REVERT ? ORIGINAL_PRICE : TEST_PRICE;
  const [updated] = await db
    .update(plans)
    .set({ basePriceMonthly: price })
    .where(eq(plans.key, "basic_forex"))
    .returning();

  if (!updated) {
    console.error('No plan found with key "basic_forex" — nothing changed.');
  } else {
    console.log(`Done — "${updated.name} (${updated.market})" basePriceMonthly is now ${price}.`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
