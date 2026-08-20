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

const stageLabel: Record<string, string> = {
  started: "Started",
  checkout_started: "Checkout started",
  paid: "Paid",
};

const stageClass: Record<string, string> = {
  started: "border rule text-paper-dim",
  checkout_started: "border rule text-brass-bright",
  paid: "border rule bg-ledger-green-soft text-paper",
};

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
            {rows.map(({ registration, user }) => (
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
                    {user && (
                      <p className="ledger-figure mt-2 text-sm text-brass-bright">
                        Subscription: {user.subscriptionStatus}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        stageClass[registration.stage]
                      }`}
                    >
                      {stageLabel[registration.stage]}
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
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
