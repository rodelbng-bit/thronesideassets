import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import NewsSection from "@/components/NewsSection";
import { getR2SANews } from "@/lib/news";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Serviced Accommodation & R2SA News",
  description:
    "Serviced accommodation and short-term let headlines from around the UK, refreshed daily.",
  path: "/news",
});

export default async function NewsPage() {
  const news = await getR2SANews();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20 md:pt-28">
        <PageHero eyebrow="News" accent="News." />

        {news.length === 0 ? (
          <div className="mt-10 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
            No headlines right now — check back soon.
          </div>
        ) : (
          <NewsSection items={news} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
