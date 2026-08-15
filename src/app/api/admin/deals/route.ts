import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, deals } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

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
  const { title, location, description, photos, ratePerNight, utilityCostPerMonth } =
    data;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof location !== "string" ||
    !location.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    !Array.isArray(photos) ||
    photos.length === 0 ||
    !photos.every((p) => typeof p === "string") ||
    !Number.isFinite(ratePerNight) ||
    ratePerNight <= 0 ||
    !Number.isFinite(utilityCostPerMonth) ||
    utilityCostPerMonth < 0
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 }
    );
  }

  const [deal] = await db
    .insert(deals)
    .values({
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      photos,
      ratePerNight: Math.round(ratePerNight),
      utilityCostPerMonth: Math.round(utilityCostPerMonth),
    })
    .returning();

  revalidatePath("/deals");

  return NextResponse.json({ deal });
}
