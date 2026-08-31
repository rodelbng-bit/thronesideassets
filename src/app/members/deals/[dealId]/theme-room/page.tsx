import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ThemeSelector from "@/components/ThemeSelector";
import ThemeLookGallery from "@/components/ThemeLookGallery";
import RoomTypeSelector from "@/components/RoomTypeSelector";
import RoomRedesignForm from "@/components/RoomRedesignForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import type { ThemeCategory } from "@/lib/schema";
import { getDeal } from "@/lib/deals";
import { getRedesignsForDeal } from "@/lib/themeRoom";
import { ROOM_TYPES, type RoomType } from "@/lib/roomTypes";
import { THEME_STYLES } from "@/lib/themeStyles";

const CANONICAL_THEMES: ThemeCategory[] = ["natural", "urban", "classy", "abstract"];

export default async function ThemeRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ dealId: string }>;
  searchParams: Promise<{ theme?: string; room?: string; look?: string }>;
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
  const { theme: themeParam, room: roomParam, look: lookParam } =
    await searchParams;
  const theme: ThemeCategory = CANONICAL_THEMES.includes(
    themeParam as ThemeCategory
  )
    ? (themeParam as ThemeCategory)
    : "natural";
  const room: RoomType = ROOM_TYPES.includes(roomParam as RoomType)
    ? (roomParam as RoomType)
    : "living-room";

  const lookImages = THEME_STYLES[theme]?.exampleImagesByRoom[room] ?? [];
  const parsedLook = lookParam ? Number.parseInt(lookParam, 10) : 0;
  const lookIndex =
    Number.isInteger(parsedLook) && parsedLook >= 0 && parsedLook < lookImages.length
      ? parsedLook
      : 0;
  const referenceImageUrl = lookImages[lookIndex];

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
          Pick a look, a room type and your favourite of the 3 reference
          designs, then one of the property&apos;s photos — we&apos;ll
          restyle it toward that design and mark every piece in the result
          with a link to buy it from a UK retailer.
        </p>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-wide text-paper-dim">
            Look
          </p>
          <div className="mt-2">
            <ThemeSelector active={theme} />
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-wide text-paper-dim">
            Room type
          </p>
          <div className="mt-2">
            <RoomTypeSelector active={room} />
          </div>
          <ThemeLookGallery theme={theme} room={room} activeLook={lookIndex} />
        </div>

        <div className="mt-8 max-w-2xl">
          <RoomRedesignForm
            dealId={dealId}
            propertyPhotos={deal.photos}
            theme={theme}
            roomType={room}
            referenceImageUrl={referenceImageUrl ?? ""}
          />
        </div>

        {pastRedesigns.length > 0 && (
          <div className="mt-16 border-t rule pt-16">
            <h2 className="font-display text-2xl text-paper">
              Past redesigns.
            </h2>
            <div className="mt-6 space-y-6">
              {pastRedesigns.map((redesign) => (
                <div
                  key={redesign.id}
                  className="rounded-lg border rule bg-ink-soft p-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <figure>
                      <figcaption className="mb-2 text-[11px] uppercase tracking-wide text-paper-dim">
                        Original
                      </figcaption>
                      <div className="relative aspect-4/3 w-full overflow-hidden rounded-md border rule">
                        <Image
                          src={redesign.originalPhotoUrl}
                          alt="Original room"
                          fill
                          sizes="(min-width: 768px) 45vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    </figure>
                    <figure>
                      <figcaption className="mb-2 text-[11px] uppercase tracking-wide text-brass-bright">
                        {redesign.theme} redesign
                      </figcaption>
                      {redesign.generatedImageUrl ? (
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-md border rule">
                          <Image
                            src={redesign.generatedImageUrl}
                            alt={`${redesign.theme} redesign`}
                            fill
                            sizes="(min-width: 768px) 45vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-4/3 w-full items-center justify-center rounded-md border rule text-xs text-paper-dim">
                          {redesign.status === "failed"
                            ? "Generation failed"
                            : "Still generating…"}
                        </div>
                      )}
                    </figure>
                  </div>
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
