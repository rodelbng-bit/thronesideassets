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
    <div className="mt-12">
      <p className="eyebrow">R2SA news</p>
      <p className="mt-3 max-w-xl text-sm text-paper-dim">
        Serviced accommodation and short-term let headlines from around the UK.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => {
          const date = formatDate(item.publishedAt);
          return (
            <li key={item.link || item.title} className="reveal">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card-lift group flex h-full flex-col justify-between gap-4 rounded-2xl border rule bg-ink-soft/60 p-5"
              >
                <span className="font-medium leading-snug text-paper transition-colors group-hover:text-brass-bright">
                  {item.title}
                </span>
                <span className="flex items-center justify-between gap-3 text-xs text-paper-dim">
                  <span>
                    {item.source}
                    {item.source && date && <span> &middot; </span>}
                    {date}
                  </span>
                  <span
                    aria-hidden
                    className="text-brass transition-transform duration-300 group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
