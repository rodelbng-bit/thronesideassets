import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, themeRedesigns } from "@/lib/schema";
import { getDeal } from "@/lib/deals";
import { gatherThemeShoppingList } from "@/lib/themeRoom";
import { generateRedesign } from "@/lib/imageRedesign";
import { locateItemsInImage } from "@/lib/imageItemLocator";
import { getThemeStyle } from "@/lib/themeStyles";

// The image edit takes ~10-20s, price lookups and a vision call to locate
// items add more — give the serverless function room to wait for it all
// synchronously rather than building out a job queue for a first version
// of this feature.
export const maxDuration = 90;

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

  if (user?.subscriptionStatus !== "active") {
    return NextResponse.json(
      { error: "Active membership required." },
      { status: 403 }
    );
  }

  const data = await req.json();
  const { dealId, theme, photoUrl } = data;

  if (
    typeof dealId !== "string" ||
    !dealId.trim() ||
    typeof theme !== "string" ||
    !theme.trim() ||
    typeof photoUrl !== "string" ||
    !photoUrl.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 }
    );
  }

  const deal = await getDeal(dealId);
  if (!deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const [redesign] = await db
    .insert(themeRedesigns)
    .values({
      userId: session.user.id,
      dealId,
      theme: theme.trim(),
      originalPhotoUrl: photoUrl.trim(),
      status: "pending",
    })
    .returning();

  try {
    // The items to shop for this theme, priced against the deal's location.
    // These also steer the render — the model can't drop in the exact
    // product photos, but the descriptions nudge the imagined furniture
    // toward them.
    const shoppingList = await gatherThemeShoppingList(
      theme.trim(),
      deal.location
    );

    const rawGeneratedUrl = await generateRedesign(
      photoUrl.trim(),
      theme.trim(),
      shoppingList.map((item) => ({
        name: item.name,
        description: item.description,
      })),
      getThemeStyle(theme.trim())?.stylePrompt ?? ""
    );

    // Replicate's output URL isn't guaranteed to stay live indefinitely —
    // re-host it in Blob storage alongside the rest of this site's images.
    const imageRes = await fetch(rawGeneratedUrl);
    if (!imageRes.ok) throw new Error("Could not fetch the generated image.");
    const imageBuffer = await imageRes.arrayBuffer();
    const blob = await put(
      `theme-redesigns/${session.user.id}/${redesign.id}.png`,
      Buffer.from(imageBuffer),
      { access: "public", contentType: "image/png" }
    );

    await db
      .update(themeRedesigns)
      .set({ status: "complete", generatedImageUrl: blob.url })
      .where(eq(themeRedesigns.id, redesign.id));

    // Ask a vision model roughly where each item landed in the render so the
    // client can pin a clickable "where to buy" marker on it. Best-effort —
    // an empty result just means no markers, the list below still renders.
    const points = await locateItemsInImage(
      blob.url,
      shoppingList.map((item) => item.name)
    );
    const items = shoppingList.map((item) => ({
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price,
      point: points[item.name] ?? null,
    }));

    return NextResponse.json({
      redesign: { id: redesign.id, generatedImageUrl: blob.url },
      items,
    });
  } catch (err) {
    await db
      .update(themeRedesigns)
      .set({ status: "failed" })
      .where(eq(themeRedesigns.id, redesign.id));
    console.error("Theme Room redesign failed", err);
    return NextResponse.json(
      { error: "Could not generate a redesign right now. Try again shortly." },
      { status: 502 }
    );
  }
}
