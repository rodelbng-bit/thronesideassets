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

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Set it in .env.local (see .env.example).`
    );
  }
  return value;
}

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

  return res.json();
}
