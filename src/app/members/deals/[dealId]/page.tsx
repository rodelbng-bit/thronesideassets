import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealCard from "@/components/DealCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, dealReservations } from "@/lib/schema";
import { getDeal } from "@/lib/deals";

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
  const deal = await getDeal(dealId);
  if (!deal) {
    notFound();
  }

  const [reservation] = await db
    .select()
    .from(dealReservations)
    .where(eq(dealReservations.dealId, dealId))
    .limit(1);

  const reserveState = !reservation
    ? "available"
    : reservation.userId === session.user.id
      ? "reserved-by-me"
      : "reserved-by-other";

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

        <div className="mt-6">
          <DealCard deal={deal} reserveState={reserveState} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
