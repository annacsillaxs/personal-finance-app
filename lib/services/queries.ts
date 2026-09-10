import { and, eq, type SQL } from "drizzle-orm";
import { entries } from "@/lib/db/schema";

/**
 * Shared predicates over the ledger.
 *
 * The `entries` table holds three kinds of row. Spending, pot transfers and
 * the opening balance all live together, which is what makes the balance a
 * single SUM — but it also means any query that means "transactions" and
 * forgets to say so will quietly include "moved £50 to Savings".
 *
 * Import these instead of hand-writing the where clause.
 */

/** Everything in the user's ledger, all three kinds. Use for balance maths. */
export function allEntries(userId: string): SQL {
  return eq(entries.userId, userId);
}

/**
 * Real-world spending and income only — what the Transactions page shows.
 * Excludes pot transfers and the opening balance.
 */
export function spendingEntries(userId: string): SQL {
  return and(eq(entries.userId, userId), eq(entries.kind, "transaction"))!;
}

/** One pot's movements. A pot's total is the negated sum of these. */
export function potEntries(userId: string, potId: string): SQL {
  return and(eq(entries.userId, userId), eq(entries.potId, potId))!;
}
