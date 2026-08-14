import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealCard from "@/components/DealCard";
import { getDeals } from "@/lib/deals";

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">DEALS</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          This week&apos;s deals.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          A preview of the kind of deals members get — join to see rates,
          earnings, and reserve.
        </p>

        <div className="mt-10 space-y-8">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} blurred />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
