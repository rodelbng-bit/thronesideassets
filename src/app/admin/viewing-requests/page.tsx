import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ViewingRequestStatus from "@/components/ViewingRequestStatus";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { getViewingRequests } from "@/lib/viewingRequests";
import { getDeals } from "@/lib/deals";

export default async function ViewingRequestsAdminPage() {
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

  const [requests, deals, allUsers] = await Promise.all([
    getViewingRequests(),
    getDeals(),
    db.select().from(users),
  ]);
  const dealById = new Map(deals.map((d) => [d.id, d]));
  const userById = new Map(allUsers.map((u) => [u.id, u]));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Viewing requests.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Reach out to confirm each preferred slot, then mark it Confirmed or
          Declined. Newest first.
        </p>

        {requests.length === 0 ? (
          <div className="mt-10 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
            No viewing requests yet.
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {requests.map((r) => {
              const deal = dealById.get(r.dealId);
              const requester = userById.get(r.userId);
              return (
                <div
                  key={r.id}
                  className="rounded-lg border rule bg-ink-soft p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl text-paper">
                        {deal ? (
                          <Link
                            href={`/members/deals/${deal.id}`}
                            className="hover:text-brass-bright"
                          >
                            {deal.title}
                          </Link>
                        ) : (
                          "Deal no longer listed"
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-paper-dim">
                        {requester?.name ? `${requester.name} · ` : ""}
                        {requester?.email ?? "Unknown member"}
                      </p>
                      <p className="ledger-figure mt-2 text-sm text-brass-bright">
                        Preferred:{" "}
                        {new Date(r.preferredAt).toLocaleString("en-GB", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="mt-1 text-xs text-paper-dim">
                        Requested{" "}
                        {new Date(r.createdAt).toLocaleString("en-GB")}
                      </p>
                    </div>
                    <ViewingRequestStatus
                      requestId={r.id}
                      initialStatus={r.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
