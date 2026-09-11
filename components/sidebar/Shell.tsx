"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import styles from "./Shell.module.css";

const COOKIE = "sidebar";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Owns the one piece of shell state, because two siblings need it: the rail's
 * width and the main column's left margin.
 *
 * The initial value arrives from a cookie read on the server, so the correct
 * width is already in the first HTML response. Reading localStorage in an
 * effect would render the wrong width first and snap on every page load.
 */
export function Shell({
  initiallyMinimised,
  children,
}: {
  initiallyMinimised: boolean;
  children: ReactNode;
}) {
  const [minimised, setMinimised] = useState(initiallyMinimised);

  function toggle() {
    const next = !minimised;
    setMinimised(next);
    document.cookie = `${COOKIE}=${next ? "minimised" : "expanded"}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  }

  return (
    <div className={styles.shell} data-minimised={minimised ? "" : undefined}>
      <Sidebar minimised={minimised} onToggle={toggle} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
