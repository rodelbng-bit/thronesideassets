import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealCard from "@/components/DealCard";
import NewsSection from "@/components/NewsSection";
import { auth } from "@/lib/auth";
import { getDeals } from "@/lib/deals";
import { getR2SANews } from "@/lib/news";

export default async function DealsPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/members");
  }

  const [deals, news] = await Promise.all([getDeals(), getR2SANews()]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">DEALS</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          This week&apos;s deals.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          A preview of the kind of deals members get — join to see rates,
          earnings, and reserve.
        </p>

        <NewsSection items={news} />

        <div className="mt-16 space-y-8">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} blurred />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
