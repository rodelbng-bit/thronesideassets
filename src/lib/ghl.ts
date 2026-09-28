// Thin client for GoHighLevel's public API (LeadConnector v2).
//
// This keeps GHL as the system of record for contacts/CRM/workflows —
// the new site is just a frontend that reports into it. That means every
// automation you've already built in GHL (reservation status flips on
// property_id, pipeline stage notifications, chat widget, etc.) keeps
// working untouched.
//
// Setup:
// 1. In GHL: Settings → Business Profile → API Keys → Private Integrations
//    → create a Private Integration token with Contacts (write) scope.
// 2. Copy your Location ID from Settings → Business Profile.
// 3. Set GHL_API_KEY and GHL_LOCATION_ID in your environment (see .env.example).
//
// Docs: https://highlevel.stoplight.io/docs/integrations/

import { getEnv } from "./env";

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

export type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  /** Free-form field for tagging where a lead came from, e.g. "website-contact-form" */
  source?: string;
  /** Matches the hidden property_id field pattern already used in your GHL workflows */
  propertyId?: string;
  tags?: string[];
};

/**
 * Creates or updates (upserts, by email/phone) a contact in GHL and fires
 * whatever workflows are attached to contact creation in that location.
 */
export async function upsertGhlContact(payload: ContactPayload) {
  const apiKey = getEnv("GHL_API_KEY");
  const locationId = getEnv("GHL_LOCATION_ID");

  const res = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: GHL_API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      locationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      tags: payload.tags ?? (payload.source ? [payload.source] : undefined),
      customFields: [
        payload.message
          ? { key: "message", field_value: payload.message }
          : undefined,
        payload.propertyId
          ? { key: "property_id", field_value: payload.propertyId }
          : undefined,
      ].filter(Boolean),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GHL contact upsert failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<{ contact: { id: string } }>;
}

// The "book a call" calendar — same one the GHL booking widget embeds.
// Booking through the API needs the Private Integration token to have the
// Calendars and Calendar Events (read + write) scopes as well as Contacts.
const GHL_CALENDAR_ID = process.env.GHL_CALENDAR_ID ?? "u1093rNHSQ03sJCDKKFF";
const GHL_CALENDAR_API_VERSION = "2021-04-15";

/** Open slot start times (ISO strings, UK offset) between two instants. */
export async function getGhlFreeSlots(start: Date, end: Date, timezone: string) {
  const params = new URLSearchParams({
    startDate: String(start.getTime()),
    endDate: String(end.getTime()),
    timezone,
  });
  const res = await fetch(
    `${GHL_API_BASE}/calendars/${GHL_CALENDAR_ID}/free-slots?${params}`,
    {
      headers: {
        Authorization: `Bearer ${getEnv("GHL_API_KEY")}`,
        Version: GHL_CALENDAR_API_VERSION,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GHL free-slots failed (${res.status}): ${body}`);
  }

  // { "2026-09-29": { slots: [...] }, ..., traceId: "..." }
  const data: Record<string, unknown> = await res.json();
  return Object.entries(data).flatMap(([key, day]) =>
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    day &&
    typeof day === "object" &&
    Array.isArray((day as { slots?: unknown }).slots)
      ? ((day as { slots: unknown[] }).slots.filter(
          (s) => typeof s === "string"
        ) as string[])
      : []
  );
}

/** Books a confirmed appointment on the call calendar for a contact. */
export async function createGhlAppointment({
  contactId,
  startTime,
  title,
}: {
  contactId: string;
  startTime: string;
  title: string;
}) {
  const res = await fetch(`${GHL_API_BASE}/calendars/events/appointments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getEnv("GHL_API_KEY")}`,
      Version: GHL_CALENDAR_API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      calendarId: GHL_CALENDAR_ID,
      locationId: getEnv("GHL_LOCATION_ID"),
      contactId,
      startTime,
      title,
      appointmentStatus: "confirmed",
      toNotify: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GHL appointment create failed (${res.status}): ${body}`);
  }

  const data: { id?: string; appointment?: { id?: string } } = await res.json();
  return { id: data.id ?? data.appointment?.id ?? null };
}
