import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

const MAX_NAME_LENGTH = 100;

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const data = await req.json();
  const { name } = data;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > MAX_NAME_LENGTH
  ) {
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ name: name.trim() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/members/account");

  return NextResponse.json({ ok: true });
}
