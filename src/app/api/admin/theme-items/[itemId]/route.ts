import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, themeItems, themeEnum } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

const VALID_THEMES = new Set(themeEnum.enumValues);

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
  const { theme, name, category, searchKeywords, imageUrl } = data;

  const update: Partial<typeof themeItems.$inferInsert> = {};

  if (theme !== undefined) {
    if (
      typeof theme !== "string" ||
      !VALID_THEMES.has(theme as (typeof themeEnum.enumValues)[number])
    ) {
      return NextResponse.json({ error: "Invalid theme." }, { status: 400 });
    }
    update.theme = theme as (typeof themeEnum.enumValues)[number];
  }
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    update.name = name.trim();
  }
  if (category !== undefined) {
    if (typeof category !== "string" || !category.trim()) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    update.category = category.trim();
  }
  if (searchKeywords !== undefined) {
    if (typeof searchKeywords !== "string" || !searchKeywords.trim()) {
      return NextResponse.json(
        { error: "Invalid search keywords." },
        { status: 400 }
      );
    }
    update.searchKeywords = searchKeywords.trim();
  }
  if (imageUrl !== undefined) {
    if (typeof imageUrl !== "string" || !imageUrl.trim()) {
      return NextResponse.json({ error: "Invalid image." }, { status: 400 });
    }
    update.imageUrl = imageUrl.trim();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(themeItems)
    .where(eq(themeItems.id, itemId))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const [item] = await db
    .update(themeItems)
    .set(update)
    .where(eq(themeItems.id, itemId))
    .returning();

  revalidatePath("/admin/theme-room");

  return NextResponse.json({ item });
}
