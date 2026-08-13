import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dealReservations } from "@/lib/schema";
import { getDeal } from "@/lib/deals";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { dealId } = await params;
  if (!getDeal(dealId)) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  try {
    await db.insert(dealReservations).values({
      dealId,
      userId: session.user.id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Unique constraint on dealId — someone else got there first.
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "This deal has already been reserved." },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Could not reserve this deal." },
      { status: 500 }
    );
  }
}
