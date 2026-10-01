import type { ButtonHTMLAttributes, CSSProperties } from "react";
import styles from "./IconButton.module.css";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /**
   * Accessible name. Required, not optional — there is no visible text, so
   * without this the button is announced as just "button". Making it part of
   * the type means the mistake is a compile error rather than an audit finding.
   */
  label: string;
  /** Path to an SVG in /public. Used as a CSS mask so it inherits colour. */
  icon: string;
};

export function IconButton({
  label,
  icon,
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`${styles.button} ${className}`.trim()}
      aria-label={label}
      {...rest}
    >
      <span
        className={styles.icon}
        style={{ "--icon": `url(${icon})` } as CSSProperties}
        aria-hidden="true"
      />
    </button>
  );
}
