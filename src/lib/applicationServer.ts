import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { funnelApplications, type FunnelApplication } from "./schema";
import { getGhlFreeSlots } from "./ghl";
import {
  BOOKING_TIMEZONE,
  BOOKING_WINDOW_DAYS,
  bookingWindowDates,
  ukDateKey,
} from "./application";

export type { FunnelApplication };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getApplication(id: string) {
  if (!UUID_RE.test(id)) return null;
  const [application] = await db
    .select()
    .from(funnelApplications)
    .where(eq(funnelApplications.id, id))
    .limit(1);
  return application ?? null;
}

export async function getApplications(): Promise<FunnelApplication[]> {
  return db
    .select()
    .from(funnelApplications)
    .orderBy(desc(funnelApplications.createdAt));
}

/** "Jane Mary Smith" → { firstName: "Jane", lastName: "Mary Smith" } */
export function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") || undefined };
}

/**
 * GHL tags for the contact at its current stage. Always the full set, as
 * the upsert replaces the tags it's given.
 */
export function applicationTags(a: FunnelApplication) {
  const stageTag = (
    {
      disqualified: "apply-not-eligible",
      completed: "apply-completed",
      booked: "apply-booked",
    } as Record<string, string | undefined>
  )[a.status];
  return [
    "apply-started",
    ...(stageTag ? [stageTag] : []),
    ...(a.funnel ? [`funnel-${a.funnel}`] : []),
  ];
}

/** Readable summary of the answers, for the GHL contact's message field. */
export function applicationSummary(a: FunnelApplication) {
  return [
    `Deal access application (${a.status})`,
    a.experience && `Experience: ${a.experience}`,
    a.dealsWanted != null && `Deals wanted: ${a.dealsWanted}`,
    a.location && `Location: ${a.location}`,
    a.capital && `Capital available: ${a.capital}`,
    a.appointmentAt && `Call booked: ${formatUkDateTime(a.appointmentAt)}`,
    a.funnel && `Funnel: ${[a.funnel, a.utmSource, a.utmCampaign, a.utmContent].filter(Boolean).join(" · ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatUkDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Open call slots for the rolling booking window — today plus the next
 * four days (UK time), recalculated on every request so it moves forward
 * each day. Slots already in the past are dropped.
 */
export async function getOpenSlots(now = new Date()) {
  const dates = bookingWindowDates(now);
  const end = new Date(now.getTime() + (BOOKING_WINDOW_DAYS + 1) * 86_400_000);
  const slots = await getGhlFreeSlots(now, end, BOOKING_TIMEZONE);
  const open = slots.filter((slot) => {
    const at = new Date(slot);
    return at > now && dates.includes(ukDateKey(at));
  });
  // Grouped here so the browser never has to work out which UK day a
  // slot falls on.
  const days = dates.map((date) => ({
    date,
    slots: open.filter((slot) => ukDateKey(new Date(slot)) === date),
  }));
  return { days, slots: open };
}
