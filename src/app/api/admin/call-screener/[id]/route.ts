import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { callScreenerResponses, users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

// Permanently deletes a call screener response. Admin-only. Only removes
// our row — the GHL contact and any booked call stay in GHL.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const { id } = await params;

  const deleted = await db
    .delete(callScreenerResponses)
    .where(eq(callScreenerResponses.id, id))
    .returning({ id: callScreenerResponses.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  revalidatePath("/admin/call-screener");

  return NextResponse.json({ ok: true });
}
