import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { getScreenerResponses } from "@/lib/callScreener";

export default async function CallScreenerAdminPage() {
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

  const responses = await getScreenerResponses();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Call screener responses.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Submitted before each visitor reaches the booking calendar on{" "}
          <span className="ledger-figure text-paper">/contact</span>. Newest
          first.
        </p>

        {responses.length === 0 ? (
          <div className="mt-10 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
            No screener submissions yet.
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {responses.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border rule bg-ink-soft p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl text-paper">
                      {r.firstName} {r.lastName ?? ""}
                    </h3>
                    <p className="mt-1 text-sm text-paper-dim">
                      {r.email} · {r.phone}
                    </p>
                  </div>
                  <p className="ledger-figure text-xs text-paper-dim">
                    {new Date(r.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>

                <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-paper-dim">
                      Budget
                    </dt>
                    <dd className="mt-1 text-paper">{r.budget}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-paper-dim">
                      Experience level
                    </dt>
                    <dd className="mt-1 text-paper">{r.experienceLevel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-paper-dim">
                      Preferred location
                    </dt>
                    <dd className="mt-1 text-paper">{r.preferredLocation}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-paper-dim">
                      Goals
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-paper">
                      {r.goals}
                    </dd>
                  </div>
                  {r.additionalInfo && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wide text-paper-dim">
                        Additional info
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-paper">
                        {r.additionalInfo}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
