import type { Metadata } from "next";
import { THEME_COLORS } from "@/lib/design/tokens";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Design system — finance" };

const COLOR_GROUPS: { title: string; colors: { name: string; hex: string }[] }[] =
  [
    {
      title: "Beige",
      colors: [
        { name: "Beige 500", hex: "#98908B" },
        { name: "Beige 100", hex: "#F8F4F0" },
      ],
    },
    {
      title: "Grey",
      colors: [
        { name: "Grey 900", hex: "#201F24" },
        { name: "Grey 500", hex: "#696868" },
        { name: "Grey 300", hex: "#B3B3B3" },
        { name: "Grey 100", hex: "#F2F2F2" },
        { name: "White", hex: "#FFFFFF" },
      ],
    },
    {
      title: "Secondary",
      colors: THEME_COLORS.slice(0, 6).map((c) => ({
        name: c.name,
        hex: c.value.toUpperCase(),
      })),
    },
    {
      title: "Other",
      colors: THEME_COLORS.slice(6).map((c) => ({
        name: c.name,
        hex: c.value.toUpperCase(),
      })),
    },
  ];

const TYPE_PRESETS = [
  { cls: "text-preset-1", label: "Text Preset 1", spec: "Bold · 32px · 120%" },
  { cls: "text-preset-2", label: "Text Preset 2", spec: "Bold · 20px · 120%" },
  { cls: "text-preset-3", label: "Text Preset 3", spec: "Bold · 16px · 150%" },
  { cls: "text-preset-4", label: "Text Preset 4", spec: "Regular · 14px · 150%" },
  {
    cls: "text-preset-4-bold",
    label: "Text Preset 4 Bold",
    spec: "Bold · 14px · 150%",
  },
  { cls: "text-preset-5", label: "Text Preset 5", spec: "Regular · 12px · 150%" },
  {
    cls: "text-preset-5-bold",
    label: "Text Preset 5 Bold",
    spec: "Bold · 12px · 150%",
  },
];

const SPACING = [
  ["500", "40px"],
  ["400", "32px"],
  ["300", "24px"],
  ["250", "20px"],
  ["200", "16px"],
  ["150", "12px"],
  ["100", "8px"],
  ["50", "4px"],
];

export default function DesignSystemPage() {
  return (
    <main className={styles.page}>
      <header>
        <h1 className="text-preset-1">Design system</h1>
        <p className="text-preset-4" style={{ color: "var(--color-text-muted)" }}>
          Rendered from the tokens in <code>app/globals.css</code>. If something
          looks wrong here, the token is wrong.
        </p>
      </header>

      {COLOR_GROUPS.map((group) => (
        <section key={group.title} className={styles.section}>
          <h2 className="text-preset-2">{group.title}</h2>
          <hr className={styles.rule} />
          <ul className={styles.swatchGrid}>
            {group.colors.map((color) => (
              <li key={color.hex + color.name}>
                <div
                  className={styles.swatch}
                  style={{ backgroundColor: color.hex }}
                />
                <div className={styles.swatchMeta}>
                  <span className="text-preset-4-bold">{color.name}</span>
                  <span className={`text-preset-5 ${styles.mono}`}>
                    {color.hex}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className={styles.section}>
        <h2 className="text-preset-2">Typography</h2>
        <hr className={styles.rule} />
        <div>
          {TYPE_PRESETS.map((preset) => (
            <div key={preset.cls} className={styles.typeRow}>
              <span className={`text-preset-5 ${styles.mono}`}>
                {preset.label} — {preset.spec}
              </span>
              <span className={preset.cls}>
                Phasellus ultrices nulla quis nibh
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="text-preset-2">Spacing</h2>
        <hr className={styles.rule} />
        <ul className={styles.spacingList}>
          {SPACING.map(([name, px]) => (
            <li key={name} className={styles.spacingRow}>
              <span className="text-preset-4-bold">{name}</span>
              <span className={`text-preset-5 ${styles.mono}`}>{px}</span>
              <span className={styles.spacingBar} style={{ width: px }} />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className="text-preset-2">Card surface</h2>
        <hr className={styles.rule} />
        <div className={styles.card}>
          <p className="text-preset-3">Radius and shadow are placeholders</p>
          <p className="text-preset-4" style={{ color: "var(--color-text-muted)" }}>
            The screenshots did not include the <code>drop-shadow</code> effect
            style or corner radii. Replace these with the real Figma values.
          </p>
        </div>
      </section>
    </main>
  );
}
