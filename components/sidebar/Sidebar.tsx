"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import styles from "./Sidebar.module.css";

type Props = {
  minimised: boolean;
  onToggle: () => void;
};

export function Sidebar({ minimised, onToggle }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className={`${styles.sidebar} ${minimised ? styles.minimised : ""}`}
      aria-label="Main"
    >
      <Link href="/" className={styles.logo} aria-label="finance — go to overview">
        <Image
          src="/images/logo-large.svg"
          alt=""
          width={122}
          height={22}
          className={styles.logoLarge}
          priority
        />
        <Image
          src="/images/logo-small.svg"
          alt=""
          width={12}
          height={22}
          className={styles.logoSmall}
          priority
        />
      </Link>

      <ul className={styles.list} role="list">
        {NAV_ITEMS.map((item) => {
          // "/" would prefix-match every route, so it needs an exact test.
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={styles.icon}
                  style={{ "--icon": `url(${item.icon})` } as CSSProperties}
                  aria-hidden="true"
                />
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={styles.minimise}
        onClick={onToggle}
        aria-expanded={!minimised}
      >
        <span
          className={styles.icon}
          style={{ "--icon": "url(/images/icon-minimize-menu.svg)" } as CSSProperties}
          aria-hidden="true"
        />
        <span className={styles.label}>
          {minimised ? "Expand Menu" : "Minimize Menu"}
        </span>
      </button>
    </nav>
  );
}
