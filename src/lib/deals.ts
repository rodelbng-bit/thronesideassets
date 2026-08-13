// Placeholder deal content — swap for real listings when ready (see
// README "Still to do"). Reservations against these ARE real and persist
// to dealReservations, so the mechanism is fully working even though the
// content itself is illustrative.
export type Deal = {
  id: string;
  title: string;
  location: string;
  description: string;
  photos: string[];
  ratePerNight: number;
  utilityCostPerMonth: number;
  /** ISO date string — drives the freshness thermometer. */
  dateAdded: string;
};

export const deals: Deal[] = [
  {
    id: "shoreditch-2bed-conversion",
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
    dateAdded: "2026-08-10",
  },
  {
    id: "canary-wharf-purpose-built",
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
    dateAdded: "2026-08-03",
  },
  {
    id: "clapham-victorian-conversion",
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
    dateAdded: "2026-07-24",
  },
];

export function getDeal(id: string): Deal | undefined {
  return deals.find((d) => d.id === id);
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

export function freshnessFromDate(dateAdded: string): Freshness {
  const days = Math.floor(
    (Date.now() - new Date(dateAdded).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 7) return { label: "Hot", days };
  if (days <= 14) return { label: "Warm", days };
  return { label: "Cold", days };
}
