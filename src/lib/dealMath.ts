// Earnings estimates shown on deal cards. Kept free of server imports so
// the admin deal form can preview exactly what a card will show.

export type DealNumbers = {
  ratePerNight: number;
  utilityCostPerMonth: number;
  monthlyRent: number | null;
};

const OCCUPANCY_TIERS = [0.5, 0.75, 1] as const;
const DAYS_PER_MONTH = 30;

export function estimateMonthlyEarnings(deal: DealNumbers) {
  return OCCUPANCY_TIERS.map((occupancy) => {
    const gross = deal.ratePerNight * DAYS_PER_MONTH * occupancy;
    return {
      occupancy,
      // Older listings have no rent on record — those stay net of utilities only.
      net: Math.round(gross - deal.utilityCostPerMonth - (deal.monthlyRent ?? 0)),
    };
  });
}

/**
 * Twelve months at 75% occupancy. Rounded once at the end (not month by
 * month) so it matches the deal sheets: £125/night, £1,150 rent, £300
 * costs → £33,750 gross, £16,350 profit.
 */
export function estimateAnnualAt75(deal: DealNumbers) {
  const gross = deal.ratePerNight * DAYS_PER_MONTH * 0.75 * 12;
  const costs = (deal.utilityCostPerMonth + (deal.monthlyRent ?? 0)) * 12;
  return { gross: Math.round(gross), profit: Math.round(gross - costs) };
}
