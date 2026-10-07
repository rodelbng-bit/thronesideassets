import { eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "./db";
import {
  users,
  registrations,
  deals,
  dealReservations,
  type ApprovalStatus,
} from "./schema";
import { createPasswordResetToken } from "./tokens";
import { approvalStatusToStage } from "./registrations";
import { CURRENT_TERMS_VERSION } from "./siteFacts";

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
 * core behind both ensureUserForCheckoutSession (Stripe webhook /
 * /join/success) and the admin "mark payment as received" action for
 * clients who paid outside Stripe. Whichever caller fires first does
 * the work; a second call for the same email is a harmless no-op update.
 */
export async function ensureUserForRegistration(params: {
  email: string;
  registrationId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  termsAcceptedAt?: Date;
  /**
   * Pass CURRENT_TERMS_VERSION only when this call represents the account
   * actually agreeing to the /terms page content just now (the JoinForm
   * checkbox flow) — not for paths like the admin "mark paid" action where
   * no one has seen that page yet.
   */
  termsVersion?: string;
}): Promise<EnsureResult> {
  const {
    registrationId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    termsAcceptedAt,
    termsVersion,
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
        stripeCustomerId: customerId ?? existing.stripeCustomerId,
        stripeSubscriptionId: subscriptionId ?? existing.stripeSubscriptionId,
        subscriptionStatus: "active",
        subscriptionPlan: "essential",
        termsAcceptedAt: termsAcceptedAt ?? existing.termsAcceptedAt,
        termsVersionAccepted:
          termsVersion ?? existing.termsVersionAccepted,
        termsVersionAcceptedAt: termsVersion
          ? new Date()
          : existing.termsVersionAcceptedAt,
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
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        subscriptionPlan: "essential",
        termsAcceptedAt,
        termsVersionAccepted: termsVersion,
        termsVersionAcceptedAt: termsVersion ? new Date() : undefined,
        // Auto-approved on signup — a successful Stripe payment is
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

function stripeId(ref: string | { id: string } | null): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref.id;
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
  const termsAcceptedAt = session.metadata?.termsAcceptedAt;
  return ensureUserForRegistration({
    email,
    registrationId:
      session.metadata?.registrationId ??
      session.client_reference_id ??
      undefined,
    stripeCustomerId: stripeId(session.customer),
    stripeSubscriptionId: stripeId(session.subscription),
    termsAcceptedAt: termsAcceptedAt ? new Date(termsAcceptedAt) : undefined,
    // JoinForm's billing-step checkbox links to /terms and is required
    // before checkout starts, so a completed checkout session is real
    // consent to the current Terms.
    termsVersion: termsAcceptedAt ? CURRENT_TERMS_VERSION : undefined,
  });
}

export type DeleteUserResult = {
  /** deals.id values flipped back to "available" because the account held them. */
  freedDealIds: string[];
};

/**
 * Permanently removes a user account and everything the schema cascades
 * from it — password + reset tokens, deal reservations, viewing requests,
 * theme redesigns. Registration funnel rows are kept but unlinked
 * (registrations.userId → null) so drop-off history survives the delete.
 *
 * Refuses an account with an active subscription: the Stripe subscription
 * has to be cancelled first, otherwise Stripe keeps charging the card for
 * an account no one can see. Self / admin-email checks are the caller's
 * responsibility (see /api/admin/users/[id]).
 *
 * Any deal the account was still holding "Unavailable" (a confirmed
 * reservation) is set back to "available" — the reservation row that
 * recorded who it was confirmed for is about to be cascade-deleted, so
 * leaving the listing hidden would strand it. dealReservations.dealId is
 * text, not a FK, so deals are matched in app code (same as lib/deals.ts).
 */
export async function deleteUserAccount(
  userId: string
): Promise<DeleteUserResult> {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.subscriptionStatus === "active") {
      throw new Error(
        "This account has an active subscription — cancel it in Stripe before deleting."
      );
    }

    const heldReservations = await tx
      .select({ dealId: dealReservations.dealId })
      .from(dealReservations)
      .where(eq(dealReservations.userId, userId));
    const heldDealIds = new Set(heldReservations.map((r) => r.dealId));

    await tx.delete(users).where(eq(users.id, userId));

    let freedDealIds: string[] = [];
    if (heldDealIds.size > 0) {
      const allDeals = await tx.select().from(deals);
      freedDealIds = allDeals
        .filter((d) => heldDealIds.has(d.id) && d.status === "unavailable")
        .map((d) => d.id);
      if (freedDealIds.length > 0) {
        await tx
          .update(deals)
          .set({ status: "available" })
          .where(inArray(deals.id, freedDealIds));
      }
    }

    return { freedDealIds };
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
