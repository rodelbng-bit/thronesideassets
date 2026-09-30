import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, viewingRequests } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

// Permanently deletes a viewing request. Admin-only. The member can then
// request a new viewing for that deal.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(adminUser?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId } = await params;

  const deleted = await db
    .delete(viewingRequests)
    .where(eq(viewingRequests.id, requestId))
    .returning({ id: viewingRequests.id });

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "Viewing request not found" },
      { status: 404 }
    );
  }

  revalidatePath("/admin/viewing-requests");
  revalidatePath("/members/deals/[dealId]", "page");

  return NextResponse.json({ ok: true });
}
