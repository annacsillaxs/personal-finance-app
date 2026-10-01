import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { formatCents, formatPercent, percentOf } from "@/lib/money";
import type { PotSummary } from "@/lib/services/pots";
import styles from "./PotCard.module.css";

export function PotCard({ pot }: { pot: PotSummary }) {
  const percent = percentOf(pot.totalCents, pot.targetCents);
  const headingId = `pot-${pot.id}-name`;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.header}>
        <span
          className={styles.dot}
          style={{ backgroundColor: pot.theme }}
          aria-hidden="true"
        />
        <h2 id={headingId} className={`text-preset-2 ${styles.name}`}>
          {pot.name}
        </h2>
        {/*
          When this opens a menu, add aria-haspopup="menu" and an
          aria-expanded that tracks the open state. Both would be lying right
          now, so they are deliberately absent.
        */}
        <IconButton
          icon="/images/icon-dots-three-outline.svg"
          label={`${pot.name} options`}
          disabled
        />
      </div>

      <div>
        <div className={styles.savedRow}>
          <span className={`text-preset-4 ${styles.savedLabel}`}>
            Total Saved
          </span>
          <span className="text-preset-1">{formatCents(pot.totalCents)}</span>
        </div>

        {/*
          A progressbar needs a value, a range and an accessible name. The
          percentage alone would be announced as a bare number, so valuetext
          carries the money — that is what the user actually cares about.
        */}
        <div
          className={styles.track}
          role="progressbar"
          aria-labelledby={headingId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-valuetext={`${formatCents(pot.totalCents)} of ${formatCents(
            pot.targetCents
          )} saved`}
        >
          <div
            className={styles.fill}
            style={{ width: `${percent}%`, backgroundColor: pot.theme }}
          />
        </div>

        <div className={styles.meta}>
          <span className="text-preset-5-bold">
            {formatPercent(pot.totalCents, pot.targetCents)}
          </span>
          <span className="text-preset-5">
            Target of {formatCents(pot.targetCents)}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" disabled>
          + Add Money
        </Button>
        <Button variant="secondary" disabled>
          Withdraw
        </Button>
      </div>
    </article>
  );
}
