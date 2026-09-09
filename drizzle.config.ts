import { defineConfig } from "drizzle-kit";

// Next.js reads .env.local; drizzle-kit does not know about it by default.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Fine when the vars are already exported (CI, or a real .env).
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
