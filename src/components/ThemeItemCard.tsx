export default function ThemeItemCard({
  name,
  price,
}: {
  name: string;
  price: { vendorName: string; priceMinor: number; url: string } | null;
}) {
  return (
    <div className="rounded-lg border rule bg-ink-soft">
      <div className="p-4">
        <p className="text-sm text-paper">{name}</p>
        {price ? (
          <div className="mt-2 flex items-center justify-between gap-2">
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
        ) : (
          <p className="mt-2 text-xs text-paper-dim">
            No live price found right now.
          </p>
        )}
      </div>
    </div>
  );
}
