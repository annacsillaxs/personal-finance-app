export const metadata = { title: "Overview — finance" };

export default function OverviewPage() {
  return (
    <>
      <h1 className="text-preset-1">Overview</h1>
      <p
        className="text-preset-4"
        style={{ marginTop: "var(--spacing-400)", color: "var(--color-text-muted)" }}
      >
        Built last — every widget here aggregates the other pages.
      </p>
    </>
  );
}
