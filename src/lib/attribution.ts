// Ad-campaign attribution carried from the landing-page URL through the
// call screener into the DB and GHL. Read straight from the URL on /start
// (no cookies), so it only covers visitors who submit on the page they
// landed on — which is the whole point of a single-page funnel.

export const ATTRIBUTION_KEYS = [
  "funnel",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "fbclid",
] as const;

export type Attribution = Partial<
  Record<(typeof ATTRIBUTION_KEYS)[number], string>
>;

type SearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function attributionFromSearchParams(
  params: SearchParams,
  funnel: string
): Attribution {
  return {
    funnel,
    utmSource: first(params.utm_source),
    utmMedium: first(params.utm_medium),
    utmCampaign: first(params.utm_campaign),
    utmContent: first(params.utm_content),
    utmTerm: first(params.utm_term),
    fbclid: first(params.fbclid),
  };
}

/** Validates untrusted request input down to known keys and short strings. */
export function sanitizeAttribution(input: unknown): Attribution {
  if (!input || typeof input !== "object") return {};
  const result: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = (input as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      result[key] = value.trim().slice(0, 500);
    }
  }
  return result;
}
