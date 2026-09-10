import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { entries } from "@/lib/db/schema";
import { allEntries } from "./queries";

export type Balance = {
  /** Money available right now — pot money has already left this figure. */
  currentCents: number;
  /** All money in, ever. Positive. */
  incomeCents: number;
  /** All money out, ever. Positive (it is a magnitude, not a signed amount). */
  expensesCents: number;
};

/**
 * The three headline figures on the Overview page.
 *
 * Income and expenses are all-time, not this month — data.json's stated
 * income (3814.25) matches the sum of every transaction exactly, and its
 * August-only figure (311.25) matches nothing on screen.
 *
 * Both are restricted to `kind = 'transaction'`, which is the whole reason
 * the discriminator exists: the opening balance is not income, and moving
 * money into a pot is not an expense.
 *
 * Note the deliberate deviation: data.json claims expenses of 1700.50, but
 * its own transactions sum to 1699.75. We derive rather than trust — a stored
 * aggregate that disagrees with its line items is a bug, not a target.
 *
 * One round trip: FILTER lets Postgres compute all three in a single scan.
 */
export async function getBalance(userId: string): Promise<Balance> {
  const [row] = await db
    .select({
      currentCents: sql<number>`coalesce(sum(${entries.amountCents}), 0)::int`,
      incomeCents: sql<number>`coalesce(sum(${entries.amountCents}) filter (
        where ${entries.kind} = 'transaction' and ${entries.amountCents} > 0
      ), 0)::int`,
      expensesCents: sql<number>`coalesce(-sum(${entries.amountCents}) filter (
        where ${entries.kind} = 'transaction' and ${entries.amountCents} < 0
      ), 0)::int`,
    })
    .from(entries)
    .where(allEntries(userId));

  return row ?? { currentCents: 0, incomeCents: 0, expensesCents: 0 };
}

/** Just the spendable balance. Used before letting money move into a pot. */
export async function getCurrentBalanceCents(userId: string): Promise<number> {
  const [row] = await db
    .select({
      cents: sql<number>`coalesce(sum(${entries.amountCents}), 0)::int`,
    })
    .from(entries)
    .where(allEntries(userId));

  return row?.cents ?? 0;
}
