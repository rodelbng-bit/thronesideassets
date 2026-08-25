import { getEnv } from "./env";

export type PriceResult = {
  vendorName: string;
  priceMinor: number;
  url: string;
};

type SerpApiShoppingResult = {
  source?: string;
  price?: string;
  extracted_price?: number;
  product_link?: string;
  link?: string;
};

// SerpApi's `location` param only accepts its own canonical location
// strings (from its Locations API) — a free-text value like deals.location
// ("Shoreditch, East London") gets rejected outright with a 400. `gl: "uk"`
// alone still targets UK results/pricing, so it's a safe fallback.
async function fetchShoppingResults(
  query: string,
  location: string | undefined,
  apiKey: string
): Promise<SerpApiShoppingResult[] | null> {
  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    gl: "uk",
    hl: "en",
    api_key: apiKey,
  });
  if (location) params.set("location", location);

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      // Price lookups are cached in Postgres by the caller — don't also
      // rely on Next's fetch cache here.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: { shopping_results?: SerpApiShoppingResult[] } = await res.json();
    return data.shopping_results ?? [];
  } catch {
    return null;
  }
}

// Thin client around SerpApi's Google Shopping engine — isolated here so
// the price-comparison provider is swappable without touching callers.
// Returns the cheapest listing for `query`, using `location` (a free-text
// UK place name, e.g. deals.location) as the geo hint Google Shopping
// biases results toward when SerpApi recognizes it. Returns null on no
// results or on any API error — callers treat "no price found" as a
// normal, expected outcome.
export async function searchCheapestPrice(
  query: string,
  location: string
): Promise<PriceResult | null> {
  const apiKey = getEnv("SERPAPI_API_KEY");

  const raw =
    (await fetchShoppingResults(query, location, apiKey)) ??
    (await fetchShoppingResults(query, undefined, apiKey));
  if (!raw) return null;

  const results = raw.filter(
    (r): r is SerpApiShoppingResult & { extracted_price: number } =>
      typeof r.extracted_price === "number" && r.extracted_price > 0
  );
  if (results.length === 0) return null;

  const cheapest = results.reduce((best, r) =>
    r.extracted_price < best.extracted_price ? r : best
  );

  const url = cheapest.product_link ?? cheapest.link;
  if (!url) return null;

  return {
    vendorName: cheapest.source ?? "Unknown vendor",
    priceMinor: Math.round(cheapest.extracted_price * 100),
    url,
  };
}
