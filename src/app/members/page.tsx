import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SignOutButton from "@/components/SignOutButton";
import DealSummaryCard from "@/components/DealSummaryCard";
import DealsFilterBar from "@/components/DealsFilterBar";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, dealReservations } from "@/lib/schema";
import { getDeals, releaseExpiredReservations } from "@/lib/deals";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    location?: string;
    minBudget?: string;
    maxBudget?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { sort, location, minBudget, maxBudget } = await searchParams;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const isActive = user?.subscriptionStatus === "active";
  const approvalStatus = user?.approvalStatus ?? "approved";
  const showDeals = isActive && approvalStatus === "approved";

  if (showDeals) {
    await releaseExpiredReservations();
  }

  const [deals, reservations] = await Promise.all([
    showDeals ? getDeals() : Promise.resolve([]),
    showDeals ? db.select().from(dealReservations) : Promise.resolve([]),
  ]);
  const reservationByDealId = new Map(
    reservations.map((r) => [r.dealId, r])
  );

  // Members can only hold one reservation at a time — it stops counting
  // once an admin confirms it by marking that deal Unavailable.
  const myReservation = reservations.find((r) => r.userId === session.user.id);
  const myReservedDeal = myReservation
    ? deals.find((d) => d.id === myReservation.dealId)
    : undefined;
  const hasActiveReservationElsewhere =
    !!myReservedDeal && myReservedDeal.status === "available";

  const locations = Array.from(new Set(deals.map((d) => d.location))).sort();
  const minBudgetValue = minBudget ? Number(minBudget) : undefined;
  const maxBudgetValue = maxBudget ? Number(maxBudget) : undefined;

  let filteredDeals = deals.filter((deal) => {
    if (location && deal.location !== location) return false;
    if (
      minBudgetValue !== undefined &&
      !Number.isNaN(minBudgetValue) &&
      deal.ratePerNight < minBudgetValue
    )
      return false;
    if (
      maxBudgetValue !== undefined &&
      !Number.isNaN(maxBudgetValue) &&
      deal.ratePerNight > maxBudgetValue
    )
      return false;
    return true;
  });

  // getDeals() already orders hottest (newest) first — reverse for oldest first.
  if (sort === "old") {
    filteredDeals = [...filteredDeals].reverse();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-center justify-between">
          <p className="ledger-figure text-sm text-brass-bright">MEMBERS</p>
          <SignOutButton />
        </div>

        {showDeals ? (
          <>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
              This week&apos;s deals.
            </h1>
            <p className="mt-4 max-w-xl text-paper-dim">
              First come, first served — reserve a deal to take it off the
              table for other members.
            </p>

            <div className="mt-10">
              <DealsFilterBar locations={locations} />
            </div>

            {filteredDeals.length === 0 ? (
              <div className="mt-6 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
                No deals match these filters.
              </div>
            ) : (
              <div className="mt-6 space-y-8">
                {filteredDeals.map((deal) => {
                  const reservation = reservationByDealId.get(deal.id);
                  const reserveState =
                    deal.status === "unavailable"
                      ? "unavailable"
                      : !reservation
                        ? "available"
                        : reservation.userId === session.user.id
                          ? "reserved-by-me"
                          : "reserved-by-other";

                  return (
                    <DealSummaryCard
                      key={deal.id}
                      deal={deal}
                      reserveState={reserveState}
                      reservationLimitReached={hasActiveReservationElsewhere}
                      reservationExpiresAt={
                        reserveState === "reserved-by-me"
                          ? reservation?.expiresAt
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            )}
          </>
        ) : isActive && approvalStatus === "pending" ? (
          <>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
              Your application is under review.
            </h1>
            <p className="mt-4 text-paper-dim">
              Thanks for joining — our team is reviewing your application and
              will confirm whether your membership is live within 12 hours.
              You&apos;ll see this week&apos;s deals here as soon as
              you&apos;re approved.
            </p>
          </>
        ) : isActive && approvalStatus === "rejected" ? (
          <>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
              We couldn&apos;t approve this application.
            </h1>
            <p className="mt-4 text-paper-dim">
              Get in touch with our team if you&apos;d like to discuss this
              further.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
            >
              Contact us
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
              Your membership isn&apos;t active.
            </h1>
            <p className="mt-4 text-paper-dim">
              We couldn&apos;t find an active membership on this account. If
              you think this is a mistake, get in touch and we&apos;ll sort
              it out.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
            >
              Contact us
            </Link>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
