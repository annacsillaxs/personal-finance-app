import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "var(--spacing-500)" }}>
      <h1 className="text-preset-1">finance</h1>
      <p className="text-preset-4" style={{ color: "var(--color-text-muted)" }}>
        Nothing here yet. Build order: Pots &rarr; Budgets &rarr; Transactions
        &rarr; Recurring Bills &rarr; Overview.
      </p>
      <p style={{ marginTop: "var(--spacing-300)" }}>
        <Link href="/design-system" className="text-preset-4-bold">
          View the design system &rarr;
        </Link>
      </p>
    </main>
  );
}
