import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { registrations, users, type ApprovalStatus } from "./schema";
import type { Registration, User } from "./schema";

export type { Registration };

export type RegistrationWithUser = {
  registration: Registration;
  user: User | null;
};

export async function getRegistrationsWithUsers(): Promise<
  RegistrationWithUser[]
> {
  return db
    .select({ registration: registrations, user: users })
    .from(registrations)
    .leftJoin(users, eq(registrations.userId, users.id))
    .orderBy(desc(registrations.startedAt));
}

// Shared between ensureUserForCheckoutSession (payment webhook) and the
// admin approval route — both resolve a users.approvalStatus and need the
// linked registration row's `stage` to agree on what that maps to.
export function approvalStatusToStage(
  status: ApprovalStatus
): Registration["stage"] {
  return status === "pending" ? "under_review" : status;
}
