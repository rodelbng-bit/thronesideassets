import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminDealWorkspace from "@/components/AdminDealWorkspace";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

export default async function NewDealPage() {
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Add a new deal.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Run the numbers first — the publish form unlocks once the deal
          clears rent and bills at 50% occupancy. It goes live to the
          members deal list immediately.
        </p>

        <div className="mt-10">
          <AdminDealWorkspace />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
