import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, viewingRequests } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId } = await params;
  const data = await req.json();
  const { status } = data;

  if (status !== "pending" && status !== "confirmed" && status !== "declined") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db
    .update(viewingRequests)
    .set({ status })
    .where(eq(viewingRequests.id, requestId))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "Viewing request not found" },
      { status: 404 }
    );
  }

  revalidatePath("/admin/viewing-requests");

  return NextResponse.json({ ok: true });
}
