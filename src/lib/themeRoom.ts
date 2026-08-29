import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  themeItems,
  itemPriceQuotes,
  themeRedesigns,
  themeEnum,
  type ThemeCategory,
  type ThemeItem,
} from "./schema";
import { searchCheapestPrice } from "./pricing";
import { suggestThemeItemQueries } from "./itemSuggestions";
import { getThemeStyle } from "./themeStyles";

const PRICE_QUOTE_TTL_MS = 24 * 60 * 60 * 1000;

const CANONICAL_THEMES = new Set<string>(themeEnum.enumValues);

// Upper bound on how many items a single redesign works with — enough for a
// full room, few enough to keep the generation prompt focused and the
// per-item price lookups from ballooning the request.
const MAX_SHOPPING_LIST = 12;

export async function getThemeItems(theme: ThemeCategory): Promise<ThemeItem[]> {
  return db
    .select()
    .from(themeItems)
    .where(and(eq(themeItems.theme, theme), eq(themeItems.active, true)))
    .orderBy(desc(themeItems.createdAt));
}

export async function getThemeItemsByIds(ids: string[]): Promise<ThemeItem[]> {
  if (ids.length === 0) return [];
  return db
    .select()
    .from(themeItems)
    .where(and(inArray(themeItems.id, ids), eq(themeItems.active, true)));
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

export type ShoppingListItem = {
  name: string;
  // Search-keyword text — feeds both the price lookup and the generation
  // prompt (steers the render toward this piece's look).
  description: string;
  imageUrl: string | null;
  price: CheapestPrice | null;
};

// The full set of items a redesign should furnish the room with and price
// up for the shopping list: the admin-curated catalog for the theme, padded
// out with Claude-suggested UK shopping queries for the same style so the
// list stays complete even when the catalog is thin. Every item is priced
// against `location` via the same SerpApi pipeline.
export async function gatherThemeShoppingList(
  theme: string,
  location: string
): Promise<ShoppingListItem[]> {
  const normalized = theme.trim().toLowerCase();

  const curated = CANONICAL_THEMES.has(normalized)
    ? await getThemeItems(normalized as ThemeCategory)
    : [];

  const curatedItems: ShoppingListItem[] = await Promise.all(
    curated.map(async (item) => ({
      name: item.name,
      description: item.searchKeywords,
      imageUrl: item.imageUrl,
      price: await getCheapestPrice(item, location),
    }))
  );

  const seen = new Set(curatedItems.map((i) => i.name.toLowerCase()));
  const remaining = Math.max(0, MAX_SHOPPING_LIST - curatedItems.length);

  // Steer the suggestions with the theme's full style brief when there is
  // one, so a padded-out list still matches the look.
  const styleDescriptor =
    getThemeStyle(theme)?.stylePrompt ?? `${theme} interior style`;

  const suggestedItems: ShoppingListItem[] =
    remaining === 0
      ? []
      : await Promise.all(
          (await suggestThemeItemQueries(styleDescriptor))
            .filter((q) => !seen.has(q.toLowerCase()))
            .slice(0, remaining)
            .map(async (query) => ({
              name: query,
              description: query,
              imageUrl: null,
              price: await searchCheapestPrice(query, location),
            }))
        );

  return [...curatedItems, ...suggestedItems].slice(0, MAX_SHOPPING_LIST);
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
