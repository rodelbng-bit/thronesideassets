// Server-side Meta Conversions API. Sends the same events the browser
// Pixel fires (matched by eventId so Meta de-duplicates them), which keeps
// ad attribution working when the browser Pixel is blocked.
//
// Setup: Meta Events Manager → your Pixel → Settings → Conversions API →
// Generate access token. Set NEXT_PUBLIC_META_PIXEL_ID and
// META_CAPI_ACCESS_TOKEN (see .env.example). Without both this is a no-op.
//
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api

import { createHash } from "node:crypto";

const GRAPH_API_VERSION = "v23.0";

export type MetaServerEvent = {
  eventName: "Lead" | "Schedule" | "ViewContent";
  eventId: string;
  eventSourceUrl?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

function hash(value: string | undefined, normalize = (v: string) => v) {
  if (!value) return undefined;
  const normalized = normalize(value.trim().toLowerCase());
  return normalized
    ? createHash("sha256").update(normalized).digest("hex")
    : undefined;
}

// Meta wants digits only, with country code — assume UK for numbers
// entered in national format (leading 0).
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `44${digits.slice(1)}` : digits;
}

export async function sendMetaEvent(event: MetaServerEvent) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: event.eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: event.eventId,
            action_source: "website",
            event_source_url: event.eventSourceUrl,
            user_data: {
              em: hash(event.email),
              ph: hash(event.phone, normalizePhone),
              fn: hash(event.firstName),
              ln: hash(event.lastName),
              client_ip_address: event.clientIp,
              client_user_agent: event.userAgent,
              fbp: event.fbp,
              fbc: event.fbc,
            },
          },
        ],
        // Set META_CAPI_TEST_EVENT_CODE while verifying in Events Manager →
        // Test Events; leave it unset in production.
        test_event_code: process.env.META_CAPI_TEST_EVENT_CODE || undefined,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta CAPI ${event.eventName} failed (${res.status}): ${body}`);
  }
}
