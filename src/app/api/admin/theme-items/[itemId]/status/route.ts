import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, themeItems } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
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

  const { itemId } = await params;
  const data = await req.json();
  const { active } = data;

  if (typeof active !== "boolean") {
    return NextResponse.json({ error: "Invalid active value" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(themeItems)
    .where(eq(themeItems.id, itemId))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db.update(themeItems).set({ active }).where(eq(themeItems.id, itemId));

  revalidatePath("/admin/theme-room");

  return NextResponse.json({ ok: true });
}
