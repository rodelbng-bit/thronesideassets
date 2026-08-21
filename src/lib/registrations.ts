import { and, desc, eq, ne } from "drizzle-orm";
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

export async function getRegistrationWithUser(
  id: string
): Promise<RegistrationWithUser | undefined> {
  const [row] = await db
    .select({ registration: registrations, user: users })
    .from(registrations)
    .leftJoin(users, eq(registrations.userId, users.id))
    .where(eq(registrations.id, id))
    .limit(1);
  return row;
}

// Other attempts by the same email — a person can restart /join after
// abandoning it, since registrations is insert-only (one row per attempt,
// never overwritten). Surfaced on the profile page rather than merged into
// one record.
export async function getOtherRegistrationsByEmail(
  email: string,
  excludeId: string
): Promise<Registration[]> {
  return db
    .select()
    .from(registrations)
    .where(and(eq(registrations.email, email), ne(registrations.id, excludeId)))
    .orderBy(desc(registrations.startedAt));
}

// Shared between ensureUserForBillingRequest (payment webhook) and the
// admin approval route — both resolve a users.approvalStatus and need the
// linked registration row's `stage` to agree on what that maps to.
export function approvalStatusToStage(
  status: ApprovalStatus
): Registration["stage"] {
  return status === "pending" ? "under_review" : status;
}

export const TERMINAL_STAGES = new Set([
  "under_review",
  "approved",
  "rejected",
]);

// Shared by /admin/clients (list) and /admin/clients/[id] (profile).
export const stageLabel: Record<string, string> = {
  // legacy values — no longer written, mapped for any pre-existing rows
  started: "Contact Details Completed",
  checkout_started: "Payment Started",
  paid: "Under Review",
  // current funnel
  contact_details_completed: "Contact Details Completed",
  screening_completed: "Screening Completed",
  plan_selected: "Plan Selected",
  payment_started: "Payment Started",
  under_review: "Under Review",
  approved: "Approved / Live",
  rejected: "Rejected",
};

export const stageClass: Record<string, string> = {
  started: "border rule text-paper-dim",
  checkout_started: "border rule text-brass-bright",
  paid: "border rule text-brass-bright",
  contact_details_completed: "border rule text-paper-dim",
  screening_completed: "border rule text-paper-dim",
  plan_selected: "border rule text-brass-bright",
  payment_started: "border rule text-brass-bright",
  under_review: "border rule text-brass-bright",
  approved: "border rule bg-ledger-green-soft text-paper",
  rejected: "border rule text-paper-dim opacity-70",
};

export const abandonedStageClass = "border rule text-paper-dim opacity-70";

const ABANDONED_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

export type RegistrationStatus = "in_progress" | "completed" | "abandoned";

// Shared by /admin/clients (list) and /admin/clients/[id] (profile) so the
// "Abandoned" label agrees exactly in both places.
export function getRegistrationStatus(
  registration: Registration
): RegistrationStatus {
  if (TERMINAL_STAGES.has(registration.stage)) return "completed";
  const stale =
    Date.now() - new Date(registration.updatedAt).getTime() >
    ABANDONED_AFTER_MS;
  return stale ? "abandoned" : "in_progress";
}
