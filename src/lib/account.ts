import { eq } from "drizzle-orm";
import { db } from "./db";
import { dealReservations } from "./schema";
import { getDeals, type Deal } from "./deals";

const CONTRACT_MONTHS = 12;

export type ContractInfo = {
  startDate: Date;
  endDate: Date;
  remaining: { months: number; days: number } | "ended";
};

// Contract term is fixed at signup (see users.termsAcceptedAt) — not tied
// to the Stripe billing cadence (monthly/annual), which can renew
// independently of this 12-month commitment.
export function getContractInfo(
  termsAcceptedAt: Date | null
): ContractInfo | null {
  if (!termsAcceptedAt) return null;

  const startDate = new Date(termsAcceptedAt);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + CONTRACT_MONTHS);

  const msRemaining = endDate.getTime() - Date.now();
  if (msRemaining <= 0) {
    return { startDate, endDate, remaining: "ended" };
  }

  const now = new Date();
  let months =
    (endDate.getFullYear() - now.getFullYear()) * 12 +
    (endDate.getMonth() - now.getMonth());
  let days = endDate.getDate() - now.getDate();
  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      0
    ).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) months = 0;

  return { startDate, endDate, remaining: { months, days } };
}

export type MemberDealActivity = {
  reserved: Deal[];
  acquired: Deal[];
};

// Mirrors the join pattern in getActiveReservationForUser (src/lib/deals.ts)
// — dealReservations.dealId is text, not a FK, so matched in app code.
export async function getMemberDealActivity(
  userId: string
): Promise<MemberDealActivity> {
  const [userReservations, allDeals] = await Promise.all([
    db.select().from(dealReservations).where(eq(dealReservations.userId, userId)),
    getDeals(),
  ]);
  const dealById = new Map(allDeals.map((d) => [d.id, d]));

  const reserved: Deal[] = [];
  const acquired: Deal[] = [];

  for (const reservation of userReservations) {
    const deal = dealById.get(reservation.dealId);
    if (!deal) continue;
    if (deal.status === "available") {
      reserved.push(deal);
    } else {
      acquired.push(deal);
    }
  }

  return { reserved, acquired };
}
