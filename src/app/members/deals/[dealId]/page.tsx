import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealCard from "@/components/DealCard";
import DealAvailabilityToggle from "@/components/DealAvailabilityToggle";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, dealReservations } from "@/lib/schema";
import {
  getDeal,
  getActiveReservationForUser,
  releaseExpiredReservations,
} from "@/lib/deals";
import { isAdminEmail } from "@/lib/admin";
import { getViewingRequestForUser } from "@/lib/viewingRequests";

export default async function MemberDealPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
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

  await releaseExpiredReservations();

  const deal = await getDeal(dealId);
  if (!deal) {
    notFound();
  }

  const [reservation] = await db
    .select()
    .from(dealReservations)
    .where(eq(dealReservations.dealId, dealId))
    .limit(1);

  const reserveState =
    deal.status === "unavailable"
      ? "unavailable"
      : !reservation
        ? "available"
        : reservation.userId === session.user.id
          ? "reserved-by-me"
          : "reserved-by-other";

  const active = await getActiveReservationForUser(session.user.id);
  const reservationLimitReached = !!active && active.deal.id !== dealId;

  const viewingRequest =
    reserveState === "reserved-by-me"
      ? await getViewingRequestForUser(dealId, session.user.id)
      : undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <Link
          href="/members"
          className="text-sm text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
        >
          ← Back to deals
        </Link>

        {isAdminEmail(user?.email) && (
          <div className="mt-6">
            <DealAvailabilityToggle
              dealId={deal.id}
              initialStatus={deal.status}
            />
          </div>
        )}

        <div className="mt-6">
          <Link
            href={`/members/deals/${dealId}/theme-room`}
            className="inline-flex items-center rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
          >
            Open Theme Room
          </Link>
        </div>

        <div className="mt-6">
          <DealCard
            deal={deal}
            reserveState={reserveState}
            reservationLimitReached={reservationLimitReached}
            reservationExpiresAt={
              reserveState === "reserved-by-me"
                ? reservation?.expiresAt
                : undefined
            }
            viewingRequest={
              viewingRequest
                ? {
                    preferredAt: viewingRequest.preferredAt,
                    status: viewingRequest.status,
                  }
                : undefined
            }
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
