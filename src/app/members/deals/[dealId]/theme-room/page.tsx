import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ThemeSelector from "@/components/ThemeSelector";
import ThemeItemCard from "@/components/ThemeItemCard";
import ThemeItemPrice, {
  ThemeItemPriceSkeleton,
} from "@/components/ThemeItemPrice";
import RoomRedesignForm from "@/components/RoomRedesignForm";
import DealGallery from "@/components/DealGallery";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import type { ThemeCategory } from "@/lib/schema";
import { getDeal } from "@/lib/deals";
import { getThemeItems, getRedesignsForDeal } from "@/lib/themeRoom";

const CANONICAL_THEMES: ThemeCategory[] = ["natural", "urban", "classy", "abstract"];

export default async function ThemeRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ dealId: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (user?.subscriptionStatus !== "active") {
    redirect("/members");
  }

  const { dealId } = await params;
  const { theme: themeParam } = await searchParams;
  const theme: ThemeCategory = CANONICAL_THEMES.includes(
    themeParam as ThemeCategory
  )
    ? (themeParam as ThemeCategory)
    : "natural";

  // All three are quick indexed queries — run them together rather than
  // in series. The slow part (per-item live pricing) is streamed below.
  const [deal, items, pastRedesigns] = await Promise.all([
    getDeal(dealId),
    getThemeItems(theme),
    getRedesignsForDeal(session.user.id, dealId),
  ]);

  if (!deal) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <Link
          href={`/members/deals/${dealId}`}
          className="text-sm text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
        >
          ← Back to {deal.title}
        </Link>

        <p className="mt-6 ledger-figure text-sm text-brass-bright">
          THEME ROOM
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Style {deal.title}.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Pick a look and we&apos;ll show you everything you need to kit the
          property out, priced at the cheapest live listing we can find.
        </p>

        {deal.photos.length > 0 && (
          <div className="mt-10">
            <DealGallery photos={deal.photos} alt={deal.title} />
          </div>
        )}

        <div className="mt-10">
          <ThemeSelector active={theme} />
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
            No items curated for this style yet.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {items.map((item) => (
              <ThemeItemCard
                key={item.id}
                name={item.name}
                priceSlot={
                  <Suspense fallback={<ThemeItemPriceSkeleton />}>
                    <ThemeItemPrice item={item} location={deal.location} />
                  </Suspense>
                }
              />
            ))}
          </div>
        )}

        <div className="mt-16 border-t rule pt-16">
          <p className="ledger-figure text-sm text-brass-bright">
            PHOTO REDESIGN
          </p>
          <h2 className="mt-3 font-display text-3xl text-paper">
            See the room in this style.
          </h2>
          <p className="mt-4 max-w-xl text-paper-dim">
            Pick one of the property&apos;s photos (or upload your own) and
            we&apos;ll restyle it in the {theme} look, then mark every piece
            in the result with a link to buy it from a UK retailer.
          </p>
          <div className="mt-8 max-w-2xl">
            <RoomRedesignForm
              dealId={dealId}
              propertyPhotos={deal.photos}
              theme={theme}
            />
          </div>
        </div>

        {pastRedesigns.length > 0 && (
          <div className="mt-16 border-t rule pt-16">
            <h2 className="font-display text-2xl text-paper">
              Past redesigns.
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {pastRedesigns.map((redesign) => (
                <div
                  key={redesign.id}
                  className="overflow-hidden rounded-lg border rule bg-ink-soft"
                >
                  {redesign.generatedImageUrl && (
                    <div className="relative aspect-4/3 w-full">
                      <Image
                        src={redesign.generatedImageUrl}
                        alt={`${redesign.theme} redesign`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="p-3 text-xs text-paper-dim">
                    {redesign.theme}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
