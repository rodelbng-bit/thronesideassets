import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "./db";
import {
  themeItems,
  itemPriceQuotes,
  themeRedesigns,
  type ThemeCategory,
  type ThemeItem,
} from "./schema";
import { searchCheapestPrice } from "./pricing";

const PRICE_QUOTE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getThemeItems(theme: ThemeCategory): Promise<ThemeItem[]> {
  return db
    .select()
    .from(themeItems)
    .where(and(eq(themeItems.theme, theme), eq(themeItems.active, true)))
    .orderBy(desc(themeItems.createdAt));
}

export type CheapestPrice = {
  vendorName: string;
  priceMinor: number;
  url: string;
};

// Cached-first cheapest-price lookup for one item near `location`. Callers
// get null when no price could be found (item not stocked online right
// now, or the price API errored) — that's an expected, displayable state,
// not a thrown error.
export async function getCheapestPrice(
  item: ThemeItem,
  location: string
): Promise<CheapestPrice | null> {
  const locationKey = location.trim().toLowerCase();
  const freshSince = new Date(Date.now() - PRICE_QUOTE_TTL_MS);

  const [cached] = await db
    .select()
    .from(itemPriceQuotes)
    .where(
      and(
        eq(itemPriceQuotes.themeItemId, item.id),
        eq(itemPriceQuotes.locationKey, locationKey),
        gt(itemPriceQuotes.fetchedAt, freshSince)
      )
    )
    .orderBy(desc(itemPriceQuotes.fetchedAt))
    .limit(1);

  if (cached) {
    return {
      vendorName: cached.vendorName,
      priceMinor: cached.priceMinor,
      url: cached.url,
    };
  }

  const result = await searchCheapestPrice(item.searchKeywords, location);
  if (!result) return null;

  await db.insert(itemPriceQuotes).values({
    themeItemId: item.id,
    locationKey,
    vendorName: result.vendorName,
    priceMinor: result.priceMinor,
    url: result.url,
  });

  return result;
}

export async function getRedesignsForDeal(userId: string, dealId: string) {
  return db
    .select()
    .from(themeRedesigns)
    .where(
      and(eq(themeRedesigns.userId, userId), eq(themeRedesigns.dealId, dealId))
    )
    .orderBy(desc(themeRedesigns.createdAt));
}
