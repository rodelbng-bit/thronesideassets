import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "./env";
import * as schema from "./schema";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { dbClient?: DbClient };

// Lazy: the Postgres client (and its getEnv("DATABASE_URL") check) must not
// run at module-evaluation time, since Next.js imports route modules during
// `next build` to collect their config, long before env vars are available.
function getDb(): DbClient {
  if (!globalForDb.dbClient) {
    const client = postgres(getEnv("DATABASE_URL"));
    globalForDb.dbClient = drizzle(client, { schema });
  }
  return globalForDb.dbClient;
}

export const db: DbClient = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
