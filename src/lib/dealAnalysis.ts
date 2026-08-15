export const DAYS_PER_MONTH = 30;
export const OTA_FEE_RATE = 0.13;
export const OCCUPANCY_TIERS = [0.5, 0.75, 1] as const;

export type OccupancyRow = {
  occupancy: number;
  nights: number;
  revenue: number;
  otaFee: number;
  revAfterOta: number;
  remaining: number;
};

export function computeOccupancyRows(
  nightlyRate: number,
  monthlyRent: number,
  monthlyBills: number
): OccupancyRow[] {
  return OCCUPANCY_TIERS.map((occupancy) => {
    const nights = occupancy * DAYS_PER_MONTH;
    const revenue = nightlyRate * nights;
    const otaFee = revenue * OTA_FEE_RATE;
    const revAfterOta = revenue - otaFee;
    const remaining = revAfterOta - monthlyRent - monthlyBills;
    return { occupancy, nights, revenue, otaFee, revAfterOta, remaining };
  });
}
