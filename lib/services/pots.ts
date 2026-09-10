import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { entries, pots } from "@/lib/db/schema";
import { getNow } from "@/lib/clock";
import {
  ConflictError,
  InsufficientFundsError,
  NotFoundError,
  ValidationError,
} from "./errors";

export type PotSummary = {
  id: string;
  name: string;
  theme: string;
  targetCents: number;
  /** Derived from the ledger. Stored nowhere. */
  totalCents: number;
};

/** Postgres unique-violation, dug out from under Drizzle's error wrapper. */
function isUniqueViolation(error: unknown): boolean {
  let cursor: unknown = error;
  for (let depth = 0; depth < 4 && cursor; depth++) {
    if ((cursor as { code?: string }).code === "23505") return true;
    cursor = (cursor as { cause?: unknown }).cause;
  }
  return false;
}

/* ===========================================================================
 * Reads
 * ========================================================================= */

export async function listPots(userId: string): Promise<PotSummary[]> {
  return db
    .select({
      id: pots.id,
      name: pots.name,
      theme: pots.theme,
      targetCents: pots.targetCents,
      // Money into a pot is negative from the balance's point of view, so a
      // pot's balance is the negated sum. LEFT JOIN keeps empty pots at zero.
      totalCents: sql<number>`coalesce(-sum(${entries.amountCents}), 0)::int`,
    })
    .from(pots)
    .leftJoin(entries, eq(entries.potId, pots.id))
    .where(and(eq(pots.userId, userId), isNull(pots.closedAt)))
    .groupBy(pots.id)
    .orderBy(asc(pots.createdAt));
}

export async function getPot(
  userId: string,
  potId: string,
): Promise<PotSummary> {
  const [pot] = await db
    .select({
      id: pots.id,
      name: pots.name,
      theme: pots.theme,
      targetCents: pots.targetCents,
      totalCents: sql<number>`coalesce(-sum(${entries.amountCents}), 0)::int`,
    })
    .from(pots)
    .leftJoin(entries, eq(entries.potId, pots.id))
    .where(
      and(eq(pots.id, potId), eq(pots.userId, userId), isNull(pots.closedAt)),
    )
    .groupBy(pots.id);

  if (!pot) throw new NotFoundError("Pot");
  return pot;
}

/** Total across every live pot — the "Total Saved" figure on Overview. */
export async function getTotalSavedCents(userId: string): Promise<number> {
  const [row] = await db
    .select({
      cents: sql<number>`coalesce(-sum(${entries.amountCents}), 0)::int`,
    })
    .from(entries)
    .innerJoin(pots, eq(entries.potId, pots.id))
    .where(and(eq(entries.userId, userId), isNull(pots.closedAt)));

  return row?.cents ?? 0;
}

/* ===========================================================================
 * Writes
 *
 * Every one of these runs inside db.transaction(). Money moving is never a
 * single statement conceptually, even when the ledger makes it a single
 * INSERT — the read that authorises it has to be part of the same atom, or
 * two concurrent requests can both pass a check that only one should.
 * ========================================================================= */

export async function createPot(input: {
  userId: string;
  name: string;
  targetCents: number;
  theme: string;
}): Promise<PotSummary> {
  const name = input.name.trim();
  if (!name) throw new ValidationError("Pot name is required");
  if (name.length > 30)
    throw new ValidationError("Pot name must be 30 characters or fewer");
  if (!Number.isInteger(input.targetCents) || input.targetCents <= 0)
    throw new ValidationError("Target must be greater than zero");

  try {
    const [pot] = await db
      .insert(pots)
      .values({
        userId: input.userId,
        name,
        targetCents: input.targetCents,
        theme: input.theme,
      })
      .returning();

    return { ...pot, totalCents: 0 };
  } catch (error) {
    if (isUniqueViolation(error))
      throw new ConflictError(`You already have a pot called "${name}"`);
    throw error;
  }
}

export async function updatePot(input: {
  userId: string;
  potId: string;
  name: string;
  targetCents: number;
  theme: string;
}): Promise<PotSummary> {
  const name = input.name.trim();
  if (!name) throw new ValidationError("Pot name is required");
  if (!Number.isInteger(input.targetCents) || input.targetCents <= 0)
    throw new ValidationError("Target must be greater than zero");

  try {
    const [updated] = await db
      .update(pots)
      .set({ name, targetCents: input.targetCents, theme: input.theme })
      .where(
        and(
          eq(pots.id, input.potId),
          eq(pots.userId, input.userId),
          isNull(pots.closedAt),
        ),
      )
      .returning();

    if (!updated) throw new NotFoundError("Pot");
    return getPot(input.userId, input.potId);
  } catch (error) {
    if (isUniqueViolation(error))
      throw new ConflictError(`You already have a pot called "${name}"`);
    throw error;
  }
}

/**
 * Closing a pot returns everything in it to the balance.
 *
 * The pot row is never deleted — ledger entries point at it, and the history
 * should stay readable. `closed_at` hides it from the app and frees its name.
 */
export async function closePot(
  userId: string,
  potId: string,
): Promise<{ returnedCents: number }> {
  return db.transaction(async (tx) => {
    await lockUser(tx, userId);

    const [pot] = await tx
      .select({
        id: pots.id,
        totalCents: sql<number>`coalesce(-sum(${entries.amountCents}), 0)::int`,
      })
      .from(pots)
      .leftJoin(entries, eq(entries.potId, pots.id))
      .where(
        and(eq(pots.id, potId), eq(pots.userId, userId), isNull(pots.closedAt)),
      )
      .groupBy(pots.id);

    if (!pot) throw new NotFoundError("Pot");

    // A zero-balance pot gets no entry — the ledger forbids zero movements.
    if (pot.totalCents > 0) {
      await tx.insert(entries).values({
        userId,
        kind: "pot_transfer",
        amountCents: pot.totalCents, // positive: coming back to the balance
        occurredAt: getNow(),
        potId,
      });
    }

    await tx.update(pots).set({ closedAt: getNow() }).where(eq(pots.id, potId));

    return { returnedCents: pot.totalCents };
  });
}

export async function addToPot(input: {
  userId: string;
  potId: string;
  amountCents: number;
}): Promise<PotSummary> {
  const { userId, potId, amountCents } = input;
  if (!Number.isInteger(amountCents) || amountCents <= 0)
    throw new ValidationError("Amount must be greater than zero");

  await db.transaction(async (tx) => {
    await lockUser(tx, userId);
    await assertPotExists(tx, userId, potId);

    const [{ cents: balance }] = await tx
      .select({
        cents: sql<number>`coalesce(sum(${entries.amountCents}), 0)::int`,
      })
      .from(entries)
      .where(eq(entries.userId, userId));

    if (amountCents > balance) {
      throw new InsufficientFundsError(
        "You do not have enough in your balance to add that much",
      );
    }

    await tx.insert(entries).values({
      userId,
      kind: "pot_transfer",
      amountCents: -amountCents, // leaving the balance
      occurredAt: getNow(),
      potId,
    });
  });

  return getPot(userId, potId);
}

export async function withdrawFromPot(input: {
  userId: string;
  potId: string;
  amountCents: number;
}): Promise<PotSummary> {
  const { userId, potId, amountCents } = input;
  if (!Number.isInteger(amountCents) || amountCents <= 0)
    throw new ValidationError("Amount must be greater than zero");

  await db.transaction(async (tx) => {
    await lockUser(tx, userId);

    const [pot] = await tx
      .select({
        totalCents: sql<number>`coalesce(-sum(${entries.amountCents}), 0)::int`,
      })
      .from(pots)
      .leftJoin(entries, eq(entries.potId, pots.id))
      .where(
        and(eq(pots.id, potId), eq(pots.userId, userId), isNull(pots.closedAt)),
      )
      .groupBy(pots.id);

    if (!pot) throw new NotFoundError("Pot");

    if (amountCents > pot.totalCents) {
      throw new InsufficientFundsError(
        "You cannot withdraw more than the pot holds",
      );
    }

    await tx.insert(entries).values({
      userId,
      kind: "pot_transfer",
      amountCents, // positive: returning to the balance
      occurredAt: getNow(),
      potId,
    });
  });

  return getPot(userId, potId);
}

/* ===========================================================================
 * Internals
 * ========================================================================= */

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Serialises this user's money operations.
 *
 * Without it, two "add £50" requests can both read the same balance, both
 * decide it is sufficient, and both insert — spending the same money twice.
 * Locking the user row makes the read-then-write atomic. It costs nothing
 * here because a user's own actions are naturally sequential.
 */
async function lockUser(tx: Tx, userId: string): Promise<void> {
  await tx.execute(sql`select id from users where id = ${userId} for update`);
}

async function assertPotExists(
  tx: Tx,
  userId: string,
  potId: string,
): Promise<void> {
  const [pot] = await tx
    .select({ id: pots.id })
    .from(pots)
    .where(
      and(eq(pots.id, potId), eq(pots.userId, userId), isNull(pots.closedAt)),
    );

  if (!pot) throw new NotFoundError("Pot");
}
