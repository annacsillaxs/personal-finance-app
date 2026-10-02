// Build-time tripwire. Every service imports this module, so if any of them is
// ever pulled into a client bundle — usually by adding "use client" to a
// component that imports a service *value* rather than just its type — the
// build fails here with a readable message, instead of silently shipping the
// Postgres driver to the browser.
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in."
  );
}

// Next.js hot-reloads modules in dev, which would otherwise open a new pool on
// every save until Postgres refuses connections. Stash the client on globalThis.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.pgClient ??
  postgres(connectionString, { max: 10, prepare: false });

if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
