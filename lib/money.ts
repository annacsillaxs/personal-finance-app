/**
 * Money is stored and passed around as integer cents, never as a float.
 *
 * `data.json` is a live demonstration of why: its stored `expenses` total is
 * 1700.50, but summing the actual transactions gives 1699.75. Binary floats
 * cannot represent most decimal fractions exactly, so sums drift.
 */

/** 12.34 -> 1234. Accepts a number or a user-typed string. */
export function toCents(value: number | string): number {
  const n = typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isFinite(n)) throw new Error(`Not a number: ${String(value)}`);
  // Round rather than truncate: 0.1 * 100 is 10.000000000000002 in binary.
  return Math.round(n * 100);
}

/** 1234 -> "$12.34" */
export function formatCents(
  cents: number,
  { showSign = false }: { showSign?: boolean } = {},
): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(cents) / 100);

  if (!showSign) return cents < 0 ? `-${formatted}` : formatted;
  return cents < 0 ? `-${formatted}` : `+${formatted}`;
}

/** Percentage of a target that has been saved, clamped to 0-100. */
export function percentOf(cents: number, targetCents: number): number {
  if (targetCents <= 0) return 0;
  return Math.min(100, Math.max(0, (cents / targetCents) * 100));
}
