import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ThemeSelector from "@/components/ThemeSelector";
import RoomRedesignForm from "@/components/RoomRedesignForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import type { ThemeCategory } from "@/lib/schema";
import { getDeal } from "@/lib/deals";
import { getRedesignsForDeal } from "@/lib/themeRoom";

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

  const [deal, pastRedesigns] = await Promise.all([
    getDeal(dealId),
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
          Restyle this room.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Pick a look and one of the property&apos;s photos — we&apos;ll
          restyle it in that style and mark every piece in the result with a
          link to buy it from a UK retailer.
        </p>

        <div className="mt-10">
          <ThemeSelector active={theme} />
        </div>

        <div className="mt-8 max-w-2xl">
          <RoomRedesignForm
            dealId={dealId}
            propertyPhotos={deal.photos}
            theme={theme}
          />
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
                  <p className="p-3 text-xs text-paper-dim">{redesign.theme}</p>
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
