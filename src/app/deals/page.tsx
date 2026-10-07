import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import DealCard from "@/components/DealCard";
import { auth } from "@/lib/auth";
import { getDeals } from "@/lib/deals";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "This Week's Property Deals",
  description:
    "A preview of this week's vetted UK property deals. Join Throneside Assets to see rates, earnings, and reserve.",
  path: "/deals",
});

export default async function DealsPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/members");
  }

  const deals = await getDeals();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20 md:pt-28">
        <PageHero eyebrow="Deals" title="This week's" accent="deals.">
          <p className="max-w-xl">
            A preview of the kind of deals members get — join to see rates,
            earnings, and reserve.
          </p>
        </PageHero>

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
