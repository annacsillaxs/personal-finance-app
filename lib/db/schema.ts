import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ===========================================================================
 * SIGN CONVENTION — read this before touching anything below.
 *
 * Every row in `entries` records a movement of money, signed from the point
 * of view of the MAIN BALANCE:
 *
 *   opening balance     +   money that already existed
 *   income              +   salary, refunds
 *   spending            -   shops, bills
 *   money into a pot    -   it left the balance
 *   money out of a pot  +   it came back
 *
 * Two consequences, and they are the whole point of the ledger:
 *
 *   current balance  =  SUM(amount_cents)
 *   a pot's total    = -SUM(amount_cents) WHERE pot_id = <pot>
 *
 * Nothing is ever erased or overwritten. Withdrawing from a pot is a new
 * row, not an edit. Deleting a pot is a compensating row that returns the
 * money, plus a `closed_at` stamp — the history stays readable.
 * ========================================================================= */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pots = pgTable(
  "pots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    targetCents: integer("target_cents").notNull(),
    theme: text("theme").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Soft delete. A hard DELETE would orphan the ledger rows that reference
    // this pot, and the notebook is supposed to stay readable.
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (t) => [
    // Two live pots may not share a name; a closed one frees the name up.
    uniqueIndex("pots_user_name_live_idx")
      .on(t.userId, t.name)
      .where(sql`${t.closedAt} is null`),
    check("pots_target_positive", sql`${t.targetCents} > 0`),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    maximumCents: integer("maximum_cents").notNull(),
    theme: text("theme").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (t) => [
    // One live budget per category — the design assumes it, so the database
    // should enforce it rather than trusting form validation.
    uniqueIndex("budgets_user_category_live_idx")
      .on(t.userId, t.category)
      .where(sql`${t.closedAt} is null`),
    check("budgets_maximum_positive", sql`${t.maximumCents} > 0`),
  ],
);

export const entryKind = pgEnum("entry_kind", [
  "opening_balance",
  "transaction",
  "pot_transfer",
]);

/**
 * The notebook. One row per movement of money, never updated, never deleted.
 */
export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: entryKind("kind").notNull(),
    /** Signed, in cents. See the note at the top of this file. */
    amountCents: integer("amount_cents").notNull(),
    /** When the money actually moved (may predate the row being written). */
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // --- kind = 'transaction' only -------------------------------------
    counterparty: text("counterparty"),
    avatarUrl: text("avatar_url"),
    category: text("category"),
    isRecurring: boolean("is_recurring"),

    // --- kind = 'pot_transfer' only ------------------------------------
    potId: uuid("pot_id").references(() => pots.id, { onDelete: "restrict" }),
  },
  (t) => [
    index("entries_user_occurred_idx").on(t.userId, t.occurredAt.desc()),
    index("entries_user_category_idx").on(t.userId, t.category),
    index("entries_pot_idx").on(t.potId),
    index("entries_user_recurring_idx")
      .on(t.userId, t.counterparty)
      .where(sql`${t.isRecurring} = true`),

    // A zero-value movement is always a bug.
    check("entries_amount_nonzero", sql`${t.amountCents} <> 0`),

    // Each kind must carry exactly its own fields and no others. Without
    // this, a 'transaction' row could quietly arrive with a pot_id and
    // corrupt every pot total that sums over it.
    check(
      "entries_shape_matches_kind",
      sql`(
        ${t.kind} = 'transaction'
          and ${t.counterparty} is not null
          and ${t.category}     is not null
          and ${t.isRecurring}  is not null
          and ${t.potId}        is null
      ) or (
        ${t.kind} = 'pot_transfer'
          and ${t.potId}        is not null
          and ${t.counterparty} is null
          and ${t.category}     is null
          and ${t.isRecurring}  is null
      ) or (
        ${t.kind} = 'opening_balance'
          and ${t.potId}        is null
          and ${t.counterparty} is null
          and ${t.category}     is null
          and ${t.isRecurring}  is null
      )`,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type Pot = typeof pots.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
