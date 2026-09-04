import { redirect } from "next/navigation";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeleteUserButton from "@/components/DeleteUserButton";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registrations } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB");
}

export default async function UsersAdminPage() {
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

  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  // Most-recent registration per account, for a link through to the full
  // client profile / funnel history.
  const regRows = await db
    .select({ id: registrations.id, userId: registrations.userId })
    .from(registrations)
    .orderBy(desc(registrations.startedAt));
  const registrationByUserId = new Map<string, string>();
  for (const row of regRows) {
    if (row.userId && !registrationByUserId.has(row.userId)) {
      registrationByUserId.set(row.userId, row.id);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Users.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Every account that can log in. Deleting an account is permanent —
          it also removes their password, deal reservations, viewing
          requests and Theme Room redesigns, and frees any deal they were
          holding. Registration funnel history is kept. An account with an
          active subscription can&apos;t be deleted until its GoCardless
          mandate is cancelled.
        </p>

        {allUsers.length === 0 ? (
          <div className="mt-10 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
            No accounts yet.
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {allUsers.map((user) => {
              const isAdmin = isAdminEmail(user.email);
              const isSelf = user.id === adminUser.id;
              const registrationId = registrationByUserId.get(user.id);

              return (
                <div
                  key={user.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-lg border rule bg-ink-soft p-6"
                >
                  <div>
                    <p className="font-display text-xl text-paper">
                      {user.name ?? "—"}
                      {isAdmin && (
                        <span className="ml-2 rounded-full border rule px-2 py-0.5 text-xs text-brass-bright">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-paper-dim">{user.email}</p>
                    <p className="ledger-figure mt-2 text-xs text-paper-dim">
                      Subscription: {user.subscriptionStatus} · Approval:{" "}
                      {user.approvalStatus} · Joined{" "}
                      {formatDate(user.createdAt)}
                    </p>
                    {registrationId && (
                      <Link
                        href={`/admin/clients/${registrationId}`}
                        className="mt-2 inline-block text-xs text-paper-dim underline-offset-2 hover:text-paper hover:underline"
                      >
                        View client profile
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isAdmin ? (
                      <p className="max-w-[14rem] text-right text-xs text-paper-dim">
                        {isSelf
                          ? "This is you."
                          : "Admin account — remove from ADMIN_EMAILS to delete."}
                      </p>
                    ) : (
                      <DeleteUserButton userId={user.id} email={user.email} />
                    )}
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
