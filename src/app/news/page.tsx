import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsSection from "@/components/NewsSection";
import { getR2SANews } from "@/lib/news";

export default async function NewsPage() {
  const news = await getR2SANews();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">NEWS</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          News.
        </h1>

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
