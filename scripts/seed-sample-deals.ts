// One-off: re-seed the 3 illustrative placeholder deals that used to be
// hardcoded in src/lib/deals.ts before deals moved to the database.
// These are NOT real listings — stock photos, made-up rates.
// Usage: npx dotenv -e .env.local -- npx tsx scripts/seed-sample-deals.ts
import { db } from "../src/lib/db";
import { deals } from "../src/lib/schema";

const SAMPLE_DEALS = [
  {
    title: "2-Bed Conversion",
    location: "Shoreditch, East London",
    description:
      "Renovated conversion above a quiet mews, close to transport links and the tech corridor. Strong short-let demand from business travellers.",
    photos: [
      "https://images.unsplash.com/photo-1633694705199-bc1e0a87c97a?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595848463742-764e6b5c11d2?w=1200&q=80&auto=format&fit=crop",
    ],
    ratePerNight: 145,
    utilityCostPerMonth: 380,
    dateAdded: new Date("2026-08-10"),
  },
  {
    title: "Purpose-Built Block",
    location: "Canary Wharf, East London",
    description:
      "Modern one-bed in a managed block with concierge. Consistent weekday occupancy from finance-district contractors.",
    photos: [
      "https://images.unsplash.com/photo-1676680071181-0a0b45968d23?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1632743441209-8a09b8a37e25?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595846265893-f433f6cca81d?w=1200&q=80&auto=format&fit=crop",
    ],
    ratePerNight: 120,
    utilityCostPerMonth: 310,
    dateAdded: new Date("2026-08-03"),
  },
  {
    title: "Victorian Conversion",
    location: "Clapham, South London",
    description:
      "Period features throughout, on a leafy residential street with good transport links into the centre. Popular with family visitors.",
    photos: [
      "https://images.unsplash.com/photo-1716576587284-691abcf83267?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603091083713-27f6b48875e7?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595846723416-99a641e1231a?w=1200&q=80&auto=format&fit=crop",
    ],
    ratePerNight: 95,
    utilityCostPerMonth: 260,
    dateAdded: new Date("2026-07-24"),
  },
];

async function main() {
  const inserted = await db.insert(deals).values(SAMPLE_DEALS).returning();
  for (const deal of inserted) {
    console.log(`Inserted: ${deal.title} (id: ${deal.id})`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
