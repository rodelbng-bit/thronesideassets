import { NextResponse } from "next/server";
import { getOpenSlots } from "@/lib/applicationServer";

export const dynamic = "force-dynamic";

// Open call slots for the final step of /start/apply — only the rolling
// 5-day window, straight from the GHL calendar.
export async function GET() {
  try {
    return NextResponse.json(await getOpenSlots());
  } catch (err) {
    console.error("Failed to load call slots", err);
    return NextResponse.json({ error: "Couldn't load available times." }, { status: 502 });
  }
}
