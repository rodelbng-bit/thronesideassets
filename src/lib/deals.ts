import { desc, eq, inArray, lt } from "drizzle-orm";
import { db } from "./db";
import { deals as dealsTable, dealReservations } from "./schema";

// How long an unconfirmed reservation holds a deal before it auto-releases
// back to "first come, first served".
export const RESERVATION_HOLD_DAYS = 3;

export type Deal = {
  id: string;
  title: string;
  location: string;
  description: string;
  photos: string[];
  ratePerNight: number;
  utilityCostPerMonth: number;
  guarantorRequired: boolean;
  status: "available" | "unavailable";
  dateAdded: Date;
};

// "unavailable" is an admin override that takes priority over whatever
// the reservation table says — used on the members deal list/detail views.
export type ReserveState =
  | "available"
  | "reserved-by-me"
  | "reserved-by-other"
  | "unavailable";

export async function getDeals(): Promise<Deal[]> {
  return db.select().from(dealsTable).orderBy(desc(dealsTable.dateAdded));
}

export async function getDeal(id: string): Promise<Deal | undefined> {
  const [deal] = await db
    .select()
    .from(dealsTable)
    .where(eq(dealsTable.id, id))
    .limit(1);
  return deal;
}

// Deletes unconfirmed reservations past their hold window so the deal
// becomes reservable again. Skips reservations on deals an admin has
// already marked "unavailable" (i.e. confirmed) — those are a record of
// who the deal was confirmed for, not an expiring hold. Called at every
// read/write path that touches reservations rather than a cron job, since
// dealId carries a unique constraint that a stale expired row would still
// block.
export async function releaseExpiredReservations(): Promise<void> {
  const [expired, allDeals] = await Promise.all([
    db
      .select()
      .from(dealReservations)
      .where(lt(dealReservations.expiresAt, new Date())),
    getDeals(),
  ]);
  if (expired.length === 0) return;

  const availableDealIds = new Set(
    allDeals.filter((d) => d.status === "available").map((d) => d.id)
  );
  const idsToRelease = expired
    .filter((r) => availableDealIds.has(r.dealId))
    .map((r) => r.id);
  if (idsToRelease.length === 0) return;

  await db
    .delete(dealReservations)
    .where(inArray(dealReservations.id, idsToRelease));
}

// Members are limited to one reservation at a time — the reservation
// only stops counting once an admin confirms it by marking that deal
// Unavailable. Matched in application code rather than a SQL join
// since dealReservations.dealId is text, not the deals.id uuid.
export async function getActiveReservationForUser(userId: string) {
  const [userReservations, allDeals] = await Promise.all([
    db.select().from(dealReservations).where(eq(dealReservations.userId, userId)),
    getDeals(),
  ]);
  const dealById = new Map(allDeals.map((d) => [d.id, d]));

  for (const reservation of userReservations) {
    const deal = dealById.get(reservation.dealId);
    if (deal && deal.status === "available") {
      return { reservation, deal };
    }
  }
  return null;
}

const OCCUPANCY_TIERS = [0.5, 0.75, 1] as const;
const DAYS_PER_MONTH = 30;

export function estimateMonthlyEarnings(deal: Deal) {
  return OCCUPANCY_TIERS.map((occupancy) => {
    const gross = deal.ratePerNight * DAYS_PER_MONTH * occupancy;
    return {
      occupancy,
      net: Math.round(gross - deal.utilityCostPerMonth),
    };
  });
}

export type Freshness = {
  label: "Hot" | "Warm" | "Cold";
  days: number;
};

export function freshnessFromDate(dateAdded: Date): Freshness {
  const days = Math.floor(
    (Date.now() - new Date(dateAdded).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 7) return { label: "Hot", days };
  if (days <= 14) return { label: "Warm", days };
  return { label: "Cold", days };
}
