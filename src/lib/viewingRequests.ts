import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { viewingRequests } from "./schema";
import type { ViewingRequest } from "./schema";

export type { ViewingRequest };

export async function getViewingRequests(): Promise<ViewingRequest[]> {
  return db
    .select()
    .from(viewingRequests)
    .orderBy(desc(viewingRequests.createdAt));
}

export async function getViewingRequestForUser(
  dealId: string,
  userId: string
): Promise<ViewingRequest | undefined> {
  const [request] = await db
    .select()
    .from(viewingRequests)
    .where(
      and(eq(viewingRequests.dealId, dealId), eq(viewingRequests.userId, userId))
    )
    .orderBy(desc(viewingRequests.createdAt))
    .limit(1);
  return request;
}
