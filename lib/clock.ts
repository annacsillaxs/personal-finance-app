/**
 * The app's clock.
 *
 * The challenge data is frozen in August 2024: budgets show "spent this
 * month", and recurring bills are "due within five days" of the latest
 * transaction (Emma Richardson, 19 Aug 2024). Wire the real system date into
 * that logic and every one of those numbers silently goes wrong — no crash,
 * no error, just an app that quietly disagrees with the design.
 *
 * So time is injected rather than read from the environment ambiently.
 * Nothing outside this file should call `new Date()` with no argument; there
 * is an ESLint rule enforcing that.
 *
 * To make the app live on real time later, delete NEXT_PUBLIC_APP_NOW from
 * .env.local. That is the entire change.
 */

const FIXED_NOW = process.env.NEXT_PUBLIC_APP_NOW;

/** The current moment, as the app understands it. */
export function getNow(): Date {
  if (!FIXED_NOW) return new Date();

  const pinned = new Date(FIXED_NOW);
  if (Number.isNaN(pinned.getTime())) {
    throw new Error(
      `NEXT_PUBLIC_APP_NOW is not a valid date: "${FIXED_NOW}". ` +
        `Expected an ISO string such as 2024-08-19T20:23:11Z.`,
    );
  }
  return pinned;
}

/**
 * Month boundaries are computed in UTC, deliberately.
 *
 * The seed timestamps are all UTC ("...Z"). Using local time would shift the
 * boundary by the server's offset, so a transaction late on 31 July would
 * count towards August for anyone east of Greenwich. No transaction in the
 * current dataset sits close enough for that to bite, which is exactly why
 * it is worth fixing now rather than after it starts producing wrong totals.
 */
export function startOfMonthUtc(date: Date = getNow()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0),
  );
}

export function endOfMonthUtc(date: Date = getNow()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );
}

export function addDaysUtc(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Day of the month, 1-31 — recurring bills repeat on their original date. */
export function dayOfMonthUtc(date: Date): number {
  return date.getUTCDate();
}
