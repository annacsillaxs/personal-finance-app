/**
 * Seeds the ledger from the challenge's data.json.
 *
 * Run with: npm run db:seed
 */
import { readFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { resolve } from "node:path";
import { db } from "./index";
import { budgets, entries, pots, users } from "./schema";
import { toCents, formatCents } from "../money";

type RawData = {
  balance: { current: number; income: number; expenses: number };
  transactions: {
    avatar: string;
    name: string;
    category: string;
    date: string;
    amount: number;
    recurring: boolean;
  }[];
  budgets: { category: string; maximum: number; theme: string }[];
  pots: { name: string; target: number; total: number; theme: string }[];
};

/**
 * data.json shipped with a copy-paste bug: "Gift" duplicated Concert Ticket's
 * 110/150, where the desktop design shows 40/60 (its 66.6% bar confirms it).
 * README line 46 says the designs win where the two disagree.
 *
 * The file in this repo has since been corrected, so this map is currently a
 * no-op. It is kept as a guard: re-downloading the starter code would quietly
 * reintroduce the bad values, and the reconciliation check would then fail
 * without explaining why.
 */
const POT_CORRECTIONS: Record<string, { total: number; target: number }> = {
  Gift: { total: 40, target: 60 },
};

const DEMO_USER = { email: "demo@example.com", name: "Demo User" };

function avatarToPublicPath(avatar: string): string {
  // "./assets/images/avatars/emma-richardson.jpg" -> "/images/avatars/..."
  return avatar.replace(/^\.?\/?assets\/images\//, "/images/");
}

async function main() {
  const raw: RawData = JSON.parse(
    readFileSync(resolve(process.cwd(), "starter-code/data.json"), "utf8"),
  );

  const correctedPots = raw.pots.map((p) => ({
    ...p,
    ...(POT_CORRECTIONS[p.name] ?? {}),
  }));

  // --- Work out the opening balance ------------------------------------
  // The ledger has to arrive at data.json's stated current balance. The 49
  // transactions only account for part of it, and the pot money has already
  // left the balance, so the remainder is history we were never given.
  // Rather than fake it, we record it as one honest opening entry — which is
  // exactly what real bookkeeping does when an account is migrated.
  const targetBalance = toCents(raw.balance.current);
  const netTransactions = raw.transactions.reduce(
    (sum, t) => sum + toCents(t.amount),
    0,
  );
  const potMoney = correctedPots.reduce((sum, p) => sum + toCents(p.total), 0);
  const openingBalance = targetBalance - netTransactions + potMoney;

  const earliest = raw.transactions
    .map((t) => new Date(t.date))
    .reduce((a, b) => (a < b ? a : b));
  const openedAt = new Date(earliest.getTime() - 24 * 60 * 60 * 1000);

  console.log("Reconciling the ledger");
  console.log(`  opening balance   ${formatCents(openingBalance)}`);
  console.log(`  net transactions  ${formatCents(netTransactions, { showSign: true })}`);
  console.log(`  moved into pots   ${formatCents(-potMoney, { showSign: true })}`);
  console.log(`  ${"".padEnd(20, "-")}`);
  console.log(`  = current balance ${formatCents(targetBalance)}`);

  await db.transaction(async (tx) => {
    // Wipe in FK-safe order so the seed is re-runnable.
    await tx.delete(entries);
    await tx.delete(pots);
    await tx.delete(budgets);
    await tx.delete(users);

    const [user] = await tx.insert(users).values(DEMO_USER).returning();

    const insertedPots = await tx
      .insert(pots)
      .values(
        correctedPots.map((p) => ({
          userId: user.id,
          name: p.name,
          targetCents: toCents(p.target),
          theme: p.theme,
        })),
      )
      .returning();

    await tx.insert(budgets).values(
      raw.budgets.map((b) => ({
        userId: user.id,
        category: b.category,
        maximumCents: toCents(b.maximum),
        theme: b.theme,
      })),
    );

    await tx.insert(entries).values([
      {
        userId: user.id,
        kind: "opening_balance" as const,
        amountCents: openingBalance,
        occurredAt: openedAt,
      },
      ...raw.transactions.map((t) => ({
        userId: user.id,
        kind: "transaction" as const,
        amountCents: toCents(t.amount),
        occurredAt: new Date(t.date),
        counterparty: t.name,
        avatarUrl: avatarToPublicPath(t.avatar),
        category: t.category,
        isRecurring: t.recurring,
      })),
      // Each pot's existing total, expressed as money that left the balance.
      ...insertedPots.map((pot) => {
        const source = correctedPots.find((p) => p.name === pot.name)!;
        return {
          userId: user.id,
          kind: "pot_transfer" as const,
          amountCents: -toCents(source.total),
          occurredAt: openedAt,
          potId: pot.id,
        };
      }),
    ]);
  });

  // --- Prove it, rather than trusting the arithmetic above --------------
  const [{ balance }] = await db.execute<{ balance: string }>(
    sql`select coalesce(sum(amount_cents), 0) as balance from entries`,
  );

  const reconciled = Number(balance);
  console.log(
    `\nLedger sums to ${formatCents(reconciled)} (expected ${formatCents(targetBalance)})`,
  );
  if (reconciled !== targetBalance) {
    throw new Error("Ledger does not reconcile — seed aborted as untrustworthy");
  }
  console.log("Reconciled.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
