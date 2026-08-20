import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ClientApprovalStatus from "@/components/ClientApprovalStatus";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { getRegistrationsWithUsers } from "@/lib/registrations";

// A prospect who hasn't reached a terminal stage in this many days shows as
// "Abandoned at <stage>" instead of the plain stage badge — a computed
// display label, not a stored status.
const ABANDONED_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

const TERMINAL_STAGES = new Set(["under_review", "approved", "rejected"]);

const stageLabel: Record<string, string> = {
  // legacy values — no longer written, mapped for any pre-existing rows
  started: "Contact Details Completed",
  checkout_started: "Payment Started",
  paid: "Under Review",
  // current funnel
  contact_details_completed: "Contact Details Completed",
  screening_completed: "Screening Completed",
  plan_selected: "Plan Selected",
  payment_started: "Payment Started",
  under_review: "Under Review",
  approved: "Approved / Live",
  rejected: "Rejected",
};

const stageClass: Record<string, string> = {
  started: "border rule text-paper-dim",
  checkout_started: "border rule text-brass-bright",
  paid: "border rule text-brass-bright",
  contact_details_completed: "border rule text-paper-dim",
  screening_completed: "border rule text-paper-dim",
  plan_selected: "border rule text-brass-bright",
  payment_started: "border rule text-brass-bright",
  under_review: "border rule text-brass-bright",
  approved: "border rule bg-ledger-green-soft text-paper",
  rejected: "border rule text-paper-dim opacity-70",
};

const abandonedClass = "border rule text-paper-dim opacity-70";

export default async function ClientsAdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(adminUser?.email)) {
    redirect("/members");
  }

  const rows = await getRegistrationsWithUsers();
  // Server Component, rendered fresh per request — the "abandoned" label
  // genuinely needs the current time it's rendered at, not a cached value.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Clients.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Every visitor who has entered the /join funnel, newest first —
          whether or not they completed it. Approve or reject a client once
          they&apos;ve paid to give or withhold access to the deals list.
        </p>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
            No registrations yet.
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {rows.map(({ registration, user }) => {
              const isTerminal = TERMINAL_STAGES.has(registration.stage);
              const isAbandoned =
                !isTerminal &&
                now - new Date(registration.updatedAt).getTime() >
                  ABANDONED_AFTER_MS;
              const badgeLabel = isAbandoned
                ? `Abandoned at ${stageLabel[registration.stage] ?? registration.stage}`
                : (stageLabel[registration.stage] ?? registration.stage);
              const badgeClass = isAbandoned
                ? abandonedClass
                : (stageClass[registration.stage] ?? "border rule text-paper-dim");

              return (
                <div
                  key={registration.id}
                  className="rounded-lg border rule bg-ink-soft p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl text-paper">
                        {registration.name}
                      </h3>
                      <p className="mt-1 text-sm text-paper-dim">
                        {registration.email} · {registration.phone}
                      </p>
                      <p className="mt-2 text-xs text-paper-dim">
                        Entered{" "}
                        {new Date(registration.startedAt).toLocaleString(
                          "en-GB"
                        )}
                        {registration.interval
                          ? ` · ${registration.interval}`
                          : ""}
                      </p>
                      {(registration.budget || registration.experienceLevel) && (
                        <p className="mt-1 text-xs text-paper-dim">
                          Screening: {registration.budget}
                          {registration.budget && registration.experienceLevel
                            ? " · "
                            : ""}
                          {registration.experienceLevel}
                        </p>
                      )}
                      {user && (
                        <p className="ledger-figure mt-2 text-sm text-brass-bright">
                          Subscription: {user.subscriptionStatus}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}
                      >
                        {badgeLabel}
                      </span>
                      {user && (
                        <ClientApprovalStatus
                          userId={user.id}
                          initialStatus={user.approvalStatus}
                        />
                      )}
                    </div>
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
