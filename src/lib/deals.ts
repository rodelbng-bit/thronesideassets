import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { deals as dealsTable } from "./schema";

export type Deal = {
  id: string;
  title: string;
  location: string;
  description: string;
  photos: string[];
  ratePerNight: number;
  utilityCostPerMonth: number;
  dateAdded: Date;
};

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
