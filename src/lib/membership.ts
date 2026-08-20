import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "./db";
import { users, registrations, type ApprovalStatus } from "./schema";
import { createPasswordResetToken } from "./tokens";
import { approvalStatusToStage } from "./registrations";

type EnsureResult = {
  userId: string;
  email: string;
  /** Set only when the account has no password yet — drives the inline "set your password" step and the fallback email. */
  resetToken?: string;
};

/**
 * Turns a paid-up registration into an active user account — the shared
 * core behind both ensureUserForCheckoutSession (Stripe webhook /
 * /join/success) and the admin "mark payment as received" action for
 * clients who paid outside Stripe. Whichever caller fires first does the
 * work; a second call for the same email is a harmless no-op update.
 */
export async function ensureUserForRegistration(params: {
  email: string;
  registrationId?: string;
  stripeCustomerId?: string;
  termsAcceptedAt?: Date;
}): Promise<EnsureResult> {
  const { registrationId, stripeCustomerId: customerId, termsAcceptedAt } =
    params;
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
        stripeCustomerId: customerId ?? existing.stripeCustomerId,
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
        stripeCustomerId: customerId,
        subscriptionStatus: "active",
        subscriptionPlan: "essential",
        termsAcceptedAt,
        // New signups are held for manual admin review in /admin/clients —
        // the `users.approvalStatus` DB default is 'approved' (so existing/
        // renewing accounts are never touched), this is the one place that
        // explicitly opts a brand-new account into the pending queue.
        approvalStatus: "pending",
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

  return { userId, email: normalizedEmail, resetToken };
}

/**
 * Turns a completed Checkout Session into an active user account. Called
 * from both the Stripe webhook and the /join/success page.
 */
export async function ensureUserForCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<EnsureResult> {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    throw new Error(`Checkout session ${session.id} has no customer email`);
  }
  return ensureUserForRegistration({
    email,
    registrationId: session.metadata?.registrationId,
    stripeCustomerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
    termsAcceptedAt: session.metadata?.termsAcceptedAt
      ? new Date(session.metadata.termsAcceptedAt)
      : undefined,
  });
}

export type SyncableStatus = "active" | "past_due" | "canceled";

export async function syncSubscriptionStatusByCustomerId(
  customerId: string,
  status: SyncableStatus
) {
  await db
    .update(users)
    .set({ subscriptionStatus: status })
    .where(eq(users.stripeCustomerId, customerId));
}
