import { getCheapestPrice } from "@/lib/themeRoom";
import type { ThemeItem } from "@/lib/schema";

// Streamed in its own <Suspense> boundary per card — the cheapest-price
// lookup hits SerpApi on a cold cache (seconds), so it must never block
// the item grid from painting.
export default async function ThemeItemPrice({
  item,
  location,
}: {
  item: ThemeItem;
  location: string;
}) {
  const price = await getCheapestPrice(item, location);

  if (!price) {
    return (
      <p className="text-xs text-paper-dim">No live price found right now.</p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="ledger-figure text-sm text-brass-bright">
        £{(price.priceMinor / 100).toFixed(2)}
      </span>
      <a
        href={price.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-paper"
      >
        Buy at {price.vendorName}
      </a>
    </div>
  );
}

export function ThemeItemPriceSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="h-4 w-14 animate-pulse rounded bg-paper-dim/20" />
      <span className="h-6 w-24 animate-pulse rounded-full bg-paper-dim/10" />
    </div>
  );
}
