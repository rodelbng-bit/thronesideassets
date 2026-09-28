// Shared by the /start/apply questionnaire (client) and /api/apply
// (server), so the options and eligibility rule can't drift apart.

export const EXPERIENCE_OPTIONS = [
  "Completely new",
  "I've researched Airbnb",
  "I currently operate a property",
  "I have multiple properties",
  "I'm a property professional",
] as const;

export const CAPITAL_OPTIONS = [
  "Less than £1,000",
  "£1,000–£3,000",
  "£3,000–£6,000",
  "£6,000–£12,000",
  "£12,000–£28,000",
  "£28,000+",
] as const;

/** Choosing this capital band ends the application as not eligible. */
export const INELIGIBLE_CAPITAL = CAPITAL_OPTIONS[0];

export const MAX_DEALS_WANTED = 100;

/** Booking shows today plus the following days — 5 days in total. */
export const BOOKING_WINDOW_DAYS = 5;

export const BOOKING_TIMEZONE = "Europe/London";

/** YYYY-MM-DD for `date` as seen in the UK. */
export function ukDateKey(date: Date) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** The UK calendar dates (YYYY-MM-DD) currently open for booking. */
export function bookingWindowDates(now = new Date()): string[] {
  const dates: string[] = [];
  // Step in 24h increments from midday UTC to stay clear of DST edges.
  const [y, m, d] = ukDateKey(now).split("-").map(Number);
  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    dates.push(ukDateKey(new Date(Date.UTC(y, m - 1, d + i, 12))));
  }
  return dates;
}
