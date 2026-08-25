import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, themeRedesigns, themeEnum, type ThemeCategory } from "@/lib/schema";
import { getDeal } from "@/lib/deals";
import { getThemeItems, getCheapestPrice } from "@/lib/themeRoom";
import { generateRedesign } from "@/lib/imageRedesign";
import { searchCheapestPrice } from "@/lib/pricing";
import { getFallbackItemQueries } from "@/lib/itemSuggestions";

// Replicate's interior-design run typically takes 10-30s — give the
// serverless function room to wait for it synchronously rather than
// building out a job queue for a first version of this feature.
export const maxDuration = 60;

const CANONICAL_THEMES = new Set(themeEnum.enumValues);

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
    const rawGeneratedUrl = await generateRedesign(photoUrl.trim(), theme.trim());

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

    const normalizedTheme = theme.trim().toLowerCase();
    const items = CANONICAL_THEMES.has(normalizedTheme as ThemeCategory)
      ? await Promise.all(
          (await getThemeItems(normalizedTheme as ThemeCategory)).map(
            async (item) => ({
              name: item.name,
              imageUrl: item.imageUrl,
              price: await getCheapestPrice(item, deal.location),
            })
          )
        )
      : await Promise.all(
          (await getFallbackItemQueries(theme.trim())).map(async (query) => ({
            name: query,
            imageUrl: null,
            price: await searchCheapestPrice(query, deal.location),
          }))
        );

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
