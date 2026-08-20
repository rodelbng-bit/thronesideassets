import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "./db";
import { users, registrations } from "./schema";
import { createPasswordResetToken } from "./tokens";

type EnsureResult = {
  userId: string;
  email: string;
  /** Set only when the account has no password yet — drives the inline "set your password" step and the fallback email. */
  resetToken?: string;
};

/**
 * Turns a completed Checkout Session into an active user account. Called
 * from both the Stripe webhook and the /join/success page — whichever
 * fires first does the work, the other is a harmless no-op update.
 */
export async function ensureUserForCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<EnsureResult> {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    throw new Error(`Checkout session ${session.id} has no customer email`);
  }
  const normalizedEmail = email.toLowerCase();
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const termsAcceptedAt = session.metadata?.termsAcceptedAt
    ? new Date(session.metadata.termsAcceptedAt)
    : undefined;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  let userId: string;
  let needsPassword: boolean;

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
  }

  const resetToken = needsPassword
    ? await createPasswordResetToken(userId)
    : undefined;

  const registrationId = session.metadata?.registrationId;
  if (registrationId) {
    // Same whichever-fires-first idempotency as the rest of this function —
    // called from both the Stripe webhook and /join/success's fallback.
    await db
      .update(registrations)
      .set({ stage: "paid", paidAt: new Date(), userId })
      .where(eq(registrations.id, registrationId));
  }

  return { userId, email: normalizedEmail, resetToken };
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
