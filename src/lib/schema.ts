import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "none",
  "active",
  "past_due",
  "canceled",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .notNull()
    .default("none"),
  subscriptionPlan: text("subscription_plan"),
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

// Deal content itself (photos, rates, etc.) lives in src/lib/deals.ts as
// hardcoded example data for now — this table only tracks which deal IDs
// have been claimed. The unique constraint on dealId is what makes
// reservations first-come-first-served under concurrent requests.
export const dealReservations = pgTable("deal_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: text("deal_id").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reservedAt: timestamp("reserved_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DealReservation = typeof dealReservations.$inferSelect;
