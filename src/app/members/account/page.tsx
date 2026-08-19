import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EditNameForm from "@/components/EditNameForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getContractInfo, getMemberDealActivity } from "@/lib/account";
import type { Deal } from "@/lib/deals";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DealRow({ deal }: { deal: Deal }) {
  return (
    <Link
      href={`/members/deals/${deal.id}`}
      className="flex items-center justify-between rounded-md border rule bg-ink px-4 py-3 transition-colors hover:border-brass/60"
    >
      <div>
        <p className="text-sm text-paper">{deal.title}</p>
        <p className="text-xs text-paper-dim">{deal.location}</p>
      </div>
      <span className="text-xs text-brass-bright">View property →</span>
    </Link>
  );
}

export default async function AccountPage() {
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

  const [activity, contract] = await Promise.all([
    getMemberDealActivity(session.user.id),
    Promise.resolve(getContractInfo(user.termsAcceptedAt)),
  ]);

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

        <p className="mt-6 ledger-figure text-sm text-brass-bright">
          MY ACCOUNT
        </p>

        <div className="mt-4 rounded-lg border rule bg-ink-soft p-6">
          <p className="text-xs uppercase tracking-wide text-paper-dim">
            Profile
          </p>
          <div className="mt-2">
            <EditNameForm initialName={user.name} />
          </div>
          <p className="mt-2 text-sm text-paper-dim">{user.email}</p>
        </div>

        <div className="mt-6 rounded-lg border rule bg-ink-soft p-6">
          <p className="text-xs uppercase tracking-wide text-paper-dim">
            Contract
          </p>
          {contract ? (
            <div className="mt-2 space-y-1 text-sm text-paper">
              <p>
                Plan:{" "}
                <span className="text-brass-bright capitalize">
                  {user.subscriptionPlan ?? "—"}
                </span>
              </p>
              <p>Started: {formatDate(contract.startDate)}</p>
              <p>
                {contract.remaining === "ended" ? (
                  <span className="text-paper-dim">
                    Contract term ended {formatDate(contract.endDate)}.
                  </span>
                ) : (
                  <>
                    Time remaining:{" "}
                    <span className="ledger-figure text-brass-bright">
                      {contract.remaining.months} months,{" "}
                      {contract.remaining.days} days
                    </span>
                  </>
                )}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-paper-dim">
              Contract details unavailable for this account — get in touch if
              you need this confirmed.
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border rule">
          <div className="bg-ink px-4 py-4 text-center">
            <p className="ledger-figure text-2xl text-paper">
              {activity.acquired.length}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-paper-dim">
              Properties Acquired
            </p>
          </div>
          <div className="bg-ink px-4 py-4 text-center">
            <p className="ledger-figure text-2xl text-paper">
              {activity.reserved.length}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-paper-dim">
              Currently Reserved
            </p>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-wide text-paper-dim">
            Currently Reserved
          </p>
          <div className="mt-3 space-y-2">
            {activity.reserved.length > 0 ? (
              activity.reserved.map((deal) => (
                <DealRow key={deal.id} deal={deal} />
              ))
            ) : (
              <p className="text-sm text-paper-dim">
                No active reservations right now.
              </p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-wide text-paper-dim">
            Acquired
          </p>
          <div className="mt-3 space-y-2">
            {activity.acquired.length > 0 ? (
              activity.acquired.map((deal) => (
                <DealRow key={deal.id} deal={deal} />
              ))
            ) : (
              <p className="text-sm text-paper-dim">
                No properties acquired yet.
              </p>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
