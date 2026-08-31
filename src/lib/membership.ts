import { eq } from "drizzle-orm";
import type { BillingRequest } from "gocardless-nodejs";
import { gocardlessClient } from "./gocardless";
import { db } from "./db";
import { users, registrations, type ApprovalStatus } from "./schema";
import { createPasswordResetToken } from "./tokens";
import { approvalStatusToStage } from "./registrations";

type EnsureResult = {
  userId: string;
  email: string;
  /** Set only when the account has no password yet — drives the inline "set your password" step and the fallback email. */
  resetToken?: string;
  /** Drives the /join/success confirmation copy — "pending" must never be presented as already-live. */
  approvalStatus: ApprovalStatus;
};

/**
 * Turns a paid-up registration into an active user account — the shared
 * core behind both ensureUserForBillingRequest (GoCardless webhook /
 * /join/success) and the admin "mark payment as received" action for
 * clients who paid outside GoCardless. Whichever caller fires first does
 * the work; a second call for the same email is a harmless no-op update.
 */
export async function ensureUserForRegistration(params: {
  email: string;
  registrationId?: string;
  gocardlessCustomerId?: string;
  gocardlessMandateId?: string;
  termsAcceptedAt?: Date;
}): Promise<EnsureResult> {
  const {
    registrationId,
    gocardlessCustomerId: customerId,
    gocardlessMandateId: mandateId,
    termsAcceptedAt,
  } = params;
  const normalizedEmail = params.email.toLowerCase();

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  let userId: string;
  let needsPassword: boolean;
  let resolvedApprovalStatus: ApprovalStatus;

  if (existing) {
    await db
      .update(users)
      .set({
        gocardlessCustomerId: customerId ?? existing.gocardlessCustomerId,
        gocardlessMandateId: mandateId ?? existing.gocardlessMandateId,
        subscriptionStatus: "active",
        subscriptionPlan: "essential",
        termsAcceptedAt: termsAcceptedAt ?? existing.termsAcceptedAt,
      })
      .where(eq(users.id, existing.id));
    userId = existing.id;
    needsPassword = !existing.passwordHash;
    // approvalStatus isn't touched by the update above, so the row already
    // fetched still reflects the current value.
    resolvedApprovalStatus = existing.approvalStatus;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        gocardlessCustomerId: customerId,
        gocardlessMandateId: mandateId,
        subscriptionStatus: "active",
        subscriptionPlan: "essential",
        termsAcceptedAt,
        // Auto-approved on signup — a successful GoCardless payment is
        // itself the gate, no manual review step. approvedAt doubles as
        // the "membership activation date" shown in /admin/clients.
        approvalStatus: "approved",
        approvedAt: new Date(),
      })
      .returning();
    userId = created.id;
    needsPassword = true;
    resolvedApprovalStatus = created.approvalStatus;
  }

  const resetToken = needsPassword
    ? await createPasswordResetToken(userId)
    : undefined;

  if (registrationId) {
    // Same whichever-fires-first idempotency as the rest of this function.
    // Jumps straight to under_review/approved/rejected rather than resting
    // on a "payment completed" stage — this function classifies the
    // account in the same synchronous call, so there's no real window
    // where payment is done but review status is unknown. `paidAt` still
    // records that payment completed.
    await db
      .update(registrations)
      .set({
        stage: approvalStatusToStage(resolvedApprovalStatus),
        paidAt: new Date(),
        userId,
        updatedAt: new Date(),
      })
      .where(eq(registrations.id, registrationId));
  }

  return {
    userId,
    email: normalizedEmail,
    resetToken,
    approvalStatus: resolvedApprovalStatus,
  };
}

/**
 * Turns a fulfilled Billing Request into an active user account. Called
 * from both the GoCardless webhook and the /join/success page.
 */
export async function ensureUserForBillingRequest(
  billingRequest: BillingRequest
): Promise<EnsureResult> {
  const customerId = billingRequest.links?.customer;
  const mandateId = billingRequest.links?.mandate_request_mandate;
  if (!customerId) {
    throw new Error(
      `Billing request ${billingRequest.id} has no customer link`
    );
  }
  const customer = await gocardlessClient.customers.find(customerId);
  if (!customer.email) {
    throw new Error(`Customer ${customerId} has no email`);
  }
  return ensureUserForRegistration({
    email: customer.email,
    registrationId: billingRequest.metadata?.registrationId,
    gocardlessCustomerId: customerId,
    gocardlessMandateId: mandateId,
    termsAcceptedAt: billingRequest.metadata?.termsAcceptedAt
      ? new Date(billingRequest.metadata.termsAcceptedAt)
      : undefined,
  });
}

export type SyncableStatus = "active" | "past_due" | "canceled";

export async function syncSubscriptionStatusByMandateId(
  mandateId: string,
  status: SyncableStatus
) {
  await db
    .update(users)
    .set({ subscriptionStatus: status })
    .where(eq(users.gocardlessMandateId, mandateId));
}
