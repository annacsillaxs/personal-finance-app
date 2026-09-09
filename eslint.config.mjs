import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/**",
  ]),
  {
    // The app's "today" is pinned to August 2024 (see lib/clock.ts). A bare
    // `new Date()` anywhere else reintroduces the real system clock and makes
    // budgets and recurring bills disagree with the design — silently.
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            "Use getNow() from lib/clock.ts instead of new Date(). The app's 'today' is pinned to August 2024.",
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message:
            "Use getNow() from lib/clock.ts instead of Date.now(). The app's 'today' is pinned to August 2024.",
        },
      ],
    },
  },
  {
    // clock.ts is the one place allowed to read the real clock.
    files: ["lib/clock.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
]);

export default eslintConfig;
