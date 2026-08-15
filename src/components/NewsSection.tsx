import type { NewsItem } from "@/lib/news";

function formatDate(publishedAt: string | null): string | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function NewsSection({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3">
        <p className="ledger-figure shrink-0 text-sm text-brass-bright">
          R2SA NEWS
        </p>
        <div className="h-0 flex-1 border-t rule" />
      </div>
      <p className="mt-3 max-w-xl text-sm text-paper-dim">
        Rent-to-serviced-accommodation headlines from around the UK.
      </p>

      <ul className="mt-6 divide-y rule">
        {items.map((item) => {
          const date = formatDate(item.publishedAt);
          return (
            <li key={item.link || item.title} className="py-4">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper transition-colors hover:text-brass-bright"
              >
                {item.title}
              </a>
              <p className="ledger-figure mt-1.5 text-xs text-paper-dim">
                {item.source}
                {item.source && date && <span> &middot; </span>}
                {date}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
