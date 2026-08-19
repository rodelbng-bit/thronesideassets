import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "none",
  "active",
  "past_due",
  "canceled",
]);

export const dealStatusEnum = pgEnum("deal_status", [
  "available",
  "unavailable",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .notNull()
    .default("none"),
  subscriptionPlan: text("subscription_plan"),
  // Set from the Checkout Session metadata written at /api/checkout —
  // the auditable record that this account agreed to the fixed 12-month
  // term (checkbox in JoinForm) before paying.
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;

// Reused for: forgot-password, the post-checkout "set your password" step,
// and legacy-member invite emails — one token mechanism instead of three.
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  photos: text("photos").array().notNull(),
  ratePerNight: integer("rate_per_night").notNull(),
  utilityCostPerMonth: integer("utility_cost_per_month").notNull(),
  guarantorRequired: boolean("guarantor_required").notNull().default(false),
  status: dealStatusEnum("status").notNull().default("available"),
  dateAdded: timestamp("date_added", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DealRow = typeof deals.$inferSelect;

// The unique constraint on dealId is what makes reservations
// first-come-first-served under concurrent requests. Not a foreign key
// against deals.id on purpose — reservations should stay put even if a
// listing is later removed.
export const dealReservations = pgTable("deal_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: text("deal_id").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reservedAt: timestamp("reserved_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  // Unconfirmed reservations auto-release after RESERVATION_HOLD_DAYS
  // (see lib/deals.ts) so a member sitting on a deal doesn't block it
  // for everyone else indefinitely.
  expiresAt: timestamp("expires_at", { withTimezone: true })
    .notNull()
    .default(sql`(now() + interval '3 days')`),
});

export type DealReservation = typeof dealReservations.$inferSelect;

// Answers from the pre-call screener shown before a visitor reaches the
// booking calendar on /contact. Also pushed into GHL as a readable summary
// on the matching contact (see /api/call-screener), but this table is the
// authoritative copy our team reviews from — it doesn't depend on GHL
// custom fields being set up.
export const callScreenerResponses = pgTable("call_screener_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  budget: text("budget").notNull(),
  goals: text("goals").notNull(),
  preferredLocation: text("preferred_location").notNull(),
  experienceLevel: text("experience_level").notNull(),
  additionalInfo: text("additional_info"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CallScreenerResponse = typeof callScreenerResponses.$inferSelect;

export const viewingRequestStatusEnum = pgEnum("viewing_request_status", [
  "pending",
  "confirmed",
  "declined",
]);

// Not a live-availability booking — the client names a preferred slot and
// the team follows up to confirm it. dealId is text (not a FK), same
// reasoning as dealReservations: the request should stay put even if the
// listing is later removed.
export const viewingRequests = pgTable("viewing_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: text("deal_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  preferredAt: timestamp("preferred_at", { withTimezone: true }).notNull(),
  status: viewingRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ViewingRequest = typeof viewingRequests.$inferSelect;
