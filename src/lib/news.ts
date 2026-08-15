import { XMLParser } from "fast-xml-parser";

const FEED_URL =
  "https://news.google.com/rss/search?q=" +
  encodeURIComponent(
    '("rent to serviced accommodation" OR "R2SA" OR "rent-to-serviced-accommodation" OR "rent to SA") UK'
  ) +
  "&hl=en-GB&gl=GB&ceid=GB:en";

const MAX_ITEMS = 6;

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
};

type RawItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string | { "#text"?: string };
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function sourceName(source: RawItem["source"]): string {
  if (!source) return "";
  if (typeof source === "string") return source;
  return source["#text"] ?? "";
}

// Google News prefixes each title with " - <Source Name>"; drop it since
// the source is already shown separately.
function stripSourceSuffix(title: string, source: string): string {
  if (!source) return title;
  const suffix = ` - ${source}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

export async function getR2SANews(): Promise<NewsItem[]> {
  let xml: string;
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (ThronesideAssets news widget)" },
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  try {
    const parser = new XMLParser({ ignoreAttributes: true });
    const parsed = parser.parse(xml);
    const items = asArray<RawItem>(parsed?.rss?.channel?.item);

    return items.slice(0, MAX_ITEMS).map((item) => {
      const source = sourceName(item.source);
      return {
        title: stripSourceSuffix(item.title ?? "Untitled", source),
        link: item.link ?? "",
        source,
        publishedAt: item.pubDate ?? null,
      };
    });
  } catch {
    return [];
  }
}
