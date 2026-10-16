"use client";

import { useActionState, useEffect, useId, useState } from "react";
import styles from "./PotForms.module.css";
import { createPotAction } from "@/lib/actions/pots";
import { THEME_COLORS } from "@/lib/design/tokens";

type Props = {
  onSuccess: () => void;
  usedThemes: string[];
};

export function PotForm({ onSuccess, usedThemes }: Props) {
  const [state, formAction, isPending] = useActionState(createPotAction, {
    status: "idle",
  });

  const firstAvailableTheme =
    THEME_COLORS.find((c) => !usedThemes.includes(c.value))?.value ??
    THEME_COLORS[0].value;
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<string>(firstAvailableTheme);

  const nameErrorId = useId();
  const targetErrorId = useId();

  useEffect(() => {
    if (state.status === "success") onSuccess();
  }, [state, onSuccess]);

  const nameError =
    state.status === "error" && state.field === "name" ? state.message : null;
  const targetError =
    state.status === "error" && state.field === "target" ? state.message : null;

  return (
    <form action={formAction}>
      <div className={styles.body}>
        <label className={styles.field}>
          <span className="text-preset-5-bold">Pot Name</span>
          <input
            name="name"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? nameErrorId : undefined}
          />
        </label>
        <span className={styles.counter}>
          {30 - name.length} characters left
        </span>
        {nameError && (
          <p id={nameErrorId} className={styles.error}>
            {nameError}
          </p>
        )}

        <label className={styles.field}>
          <span className="text-preset-5-bold">Target</span>
          <input
            type="text"
            name="target"
            placeholder="$ e.g. 50.00"
            className={styles.input}
            aria-invalid={Boolean(targetError)}
            aria-describedby={targetError ? targetErrorId : undefined}
          />
        </label>
        {targetError && (
          <p id={targetErrorId} className={styles.error}>
            {targetError}
          </p>
        )}

        <label className={styles.field}>
          <span className="text-preset-5-bold">Theme</span>

          <div className={styles.selectWrap}>
            <span
              className={styles.swatch}
              style={{ backgroundColor: theme }}
            />
            <select
              name="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={styles.select}
            >
              {THEME_COLORS.map((colour) => {
                const used = usedThemes.includes(colour.value);
                return (
                  <option
                    key={colour.value}
                    value={colour.value}
                    disabled={used}
                  >
                    {colour.name}
                    {used ? " — already used" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </label>
      </div>

      <footer className={styles.footer}>
        <button
          type="submit"
          disabled={isPending}
          className={`text-preset-4-bold ${styles.confirm}`}
        >
          Add Pot
        </button>
      </footer>
    </form>
  );
}
