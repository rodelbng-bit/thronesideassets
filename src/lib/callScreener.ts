import { desc } from "drizzle-orm";
import { db } from "./db";
import { callScreenerResponses } from "./schema";
import type { CallScreenerResponse } from "./schema";

export type { CallScreenerResponse };

export async function getScreenerResponses(): Promise<CallScreenerResponse[]> {
  return db
    .select()
    .from(callScreenerResponses)
    .orderBy(desc(callScreenerResponses.createdAt));
}
