import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, themeItems, themeEnum } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

const VALID_THEMES = new Set(themeEnum.enumValues);

export async function POST(req: NextRequest) {
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

  const data = await req.json();
  const { theme, name, category, imageUrl, searchKeywords } = data;

  if (
    typeof theme !== "string" ||
    !VALID_THEMES.has(theme as (typeof themeEnum.enumValues)[number]) ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    typeof imageUrl !== "string" ||
    !imageUrl.trim() ||
    typeof searchKeywords !== "string" ||
    !searchKeywords.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 }
    );
  }

  const [item] = await db
    .insert(themeItems)
    .values({
      theme: theme as (typeof themeEnum.enumValues)[number],
      name: name.trim(),
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      searchKeywords: searchKeywords.trim(),
    })
    .returning();

  revalidatePath("/admin/theme-room");

  return NextResponse.json({ item });
}
