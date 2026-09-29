// Validates the editable fields of a deal, shared by create (POST
// /api/admin/deals) and edit (PATCH /api/admin/deals/[dealId]). Photos
// and video are checked by each route, since edit keeps the existing ones
// unless replaced.

export type DealFields = {
  title: string;
  location: string;
  description: string;
  ratePerNight: number;
  utilityCostPerMonth: number;
  monthlyRent: number;
  deposit: number | null;
  guarantorRequired: boolean;
};

export function parseDealFields(
  data: Record<string, unknown>
): DealFields | null {
  const {
    title,
    location,
    description,
    ratePerNight,
    utilityCostPerMonth,
    monthlyRent,
    deposit,
    guarantorRequired,
  } = data;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof location !== "string" ||
    !location.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof ratePerNight !== "number" ||
    !Number.isFinite(ratePerNight) ||
    ratePerNight <= 0 ||
    typeof utilityCostPerMonth !== "number" ||
    !Number.isFinite(utilityCostPerMonth) ||
    utilityCostPerMonth < 0 ||
    typeof monthlyRent !== "number" ||
    !Number.isFinite(monthlyRent) ||
    monthlyRent <= 0 ||
    (deposit !== null &&
      (typeof deposit !== "number" || !Number.isFinite(deposit) || deposit < 0)) ||
    typeof guarantorRequired !== "boolean"
  ) {
    return null;
  }

  return {
    title: title.trim(),
    location: location.trim(),
    description: description.trim(),
    ratePerNight: Math.round(ratePerNight),
    utilityCostPerMonth: Math.round(utilityCostPerMonth),
    monthlyRent: Math.round(monthlyRent),
    deposit: deposit === null ? null : Math.round(deposit),
    guarantorRequired,
  };
}

export function isVideoUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("https://");
}
