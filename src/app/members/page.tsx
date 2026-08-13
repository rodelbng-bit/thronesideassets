import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SignOutButton from "@/components/SignOutButton";
import DealCard from "@/components/DealCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, dealReservations } from "@/lib/schema";
import { deals } from "@/lib/deals";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const isActive = user?.subscriptionStatus === "active";

  const reservations = isActive ? await db.select().from(dealReservations) : [];
  const reservationByDealId = new Map(
    reservations.map((r) => [r.dealId, r])
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-center justify-between">
          <p className="ledger-figure text-sm text-brass-bright">MEMBERS</p>
          <SignOutButton />
        </div>

        {isActive ? (
          <>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
              This week&apos;s deals.
            </h1>
            <p className="mt-4 max-w-xl text-paper-dim">
              First come, first served — reserve a deal to take it off the
              table for other members.
            </p>

            <div className="mt-10 space-y-8">
              {deals.map((deal) => {
                const reservation = reservationByDealId.get(deal.id);
                const reserveState = !reservation
                  ? "available"
                  : reservation.userId === session.user.id
                    ? "reserved-by-me"
                    : "reserved-by-other";

                return (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    reserveState={reserveState}
                  />
                );
              })}
            </div>
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
