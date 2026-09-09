/**
 * Design tokens that the app needs at runtime rather than in CSS.
 *
 * The CSS custom properties in `app/globals.css` remain the source of truth
 * for styling; this file exists because budgets and pots let the user *pick*
 * a theme colour, so the palette has to be enumerable in TypeScript.
 */

export type ThemeColor = {
  /** Label shown in the theme dropdown. */
  name: string;
  /** Hex value persisted on the budget/pot record. */
  value: string;
};

/**
 * Palette offered by the theme picker.
 *
 * Ordered Secondary-then-Other, matching the Design System page. Red is
 * included here but is also the destructive/error colour — worth checking the
 * Figma dropdown to confirm whether it is actually selectable.
 */
export const THEME_COLORS = [
  { name: "Green", value: "#277c78" },
  { name: "Yellow", value: "#f2cdac" },
  { name: "Cyan", value: "#82c9d7" },
  { name: "Navy", value: "#626070" },
  { name: "Red", value: "#c94736" },
  { name: "Purple", value: "#826cb0" },
  { name: "Purple 2", value: "#af81ba" },
  { name: "Turquoise", value: "#597c7c" },
  { name: "Brown", value: "#93674f" },
  { name: "Magenta", value: "#934f6f" },
  { name: "Blue", value: "#3f82b2" },
  { name: "Navy Grey", value: "#97a0ac" },
  { name: "Army Green", value: "#7f9161" },
  { name: "Gold", value: "#cab361" },
  { name: "Orange", value: "#be6c49" },
] as const satisfies readonly ThemeColor[];

export type ThemeColorValue = (typeof THEME_COLORS)[number]["value"];

/** Transaction categories, per the challenge README. */
export const CATEGORIES = [
  "Entertainment",
  "Bills",
  "Groceries",
  "Dining Out",
  "Transportation",
  "Personal Care",
  "Education",
  "Lifestyle",
  "Shopping",
  "General",
] as const;

export type Category = (typeof CATEGORIES)[number];
