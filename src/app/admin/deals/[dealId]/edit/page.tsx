import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealForm from "@/components/DealForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { getDeal } from "@/lib/deals";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditDealPage({
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

  if (!isAdminEmail(user?.email)) {
    redirect("/members");
  }

  const { dealId } = await params;
  const deal = UUID_RE.test(dealId) ? await getDeal(dealId) : undefined;
  if (!deal) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <Link
          href={`/members/deals/${deal.id}`}
          className="text-sm text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
        >
          ← Back to deal
        </Link>
        <p className="ledger-figure mt-8 text-sm text-brass-bright">ADMIN</p>
        <h1 className="enter mt-4 font-display text-4xl text-paper [animation-delay:90ms] md:text-5xl">
          Edit deal.
        </h1>
        <p className="mt-4 text-paper-dim">
          Changes go live everywhere the deal appears — members, /deals and
          the /start landing page — as soon as you save. Photos can&apos;t be
          changed here yet.
        </p>

        <div className="mt-10">
          <DealForm deal={deal} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
