"use client";

import type { PotSummary } from "@/lib/services/pots";
import styles from "./AddMoneyForm.module.css";
import { formatCents, formatPercent, percentOf } from "@/lib/money";
import { useActionState, useEffect, useId } from "react";
import { addMoneyAction } from "@/lib/actions/pots";

type Props = {
  pot: PotSummary;
  onSuccess: () => void;
};

export function AddMoneyForm({ pot, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState(addMoneyAction, {
    status: "idle",
  });

  const hasError = state.status === "error";
  const errorId = useId();

  useEffect(() => {
    if (state.status === "success") onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction}>
      <input type="hidden" name="potId" value={pot.id} />
      <div className={styles.body}>
        <div className={styles.amountRow}>
          <span className="text-preset-4">New Amount</span>
          <span className="text-preset-1">{formatCents(pot.totalCents)}</span>
        </div>

        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${percentOf(pot.totalCents, pot.targetCents)}%` }}
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

        <label className={styles.field}>
          <span className="text-preset-5-bold">Amount to Add</span>
          <input
            type="text"
            name="amount"
            placeholder="$ e.g. 50.00"
            className={styles.input}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
        </label>
        {state.status === "error" && <p id={errorId}>{state.message}</p>}
      </div>

      <footer className={styles.footer}>
        <button
          type="submit"
          disabled={isPending}
          className={`text-preset-4-bold ${styles.confirm}`}
        >
          Confirm Addition
        </button>
      </footer>
    </form>
  );
}
