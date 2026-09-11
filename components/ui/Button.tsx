import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "destructive" | "tertiary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
