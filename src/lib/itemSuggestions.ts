import { getEnv } from "./env";

// Used only when a member's free-text redesign theme doesn't match one of
// the four curated categories (see lib/themeRoom.ts getThemeItems) — asks
// Claude for a short list of generic furniture/decor search queries that
// fit the style, which the caller then runs through the same
// searchCheapestPrice pipeline as the curated catalog. Returns [] on any
// failure so the redesign flow still succeeds with just the generated
// image and no item list.
export async function getFallbackItemQueries(
  themePrompt: string
): Promise<string[]> {
  let apiKey: string;
  try {
    apiKey = getEnv("ANTHROPIC_API_KEY");
  } catch {
    return [];
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `List 5 short UK furniture/decor shopping search queries (e.g. "rattan pendant light") for a room redesigned in this style: "${themePrompt}". Reply with ONLY the 5 queries, one per line, no numbering or extra text.`,
          },
        ],
      }),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const text: string | undefined = data?.content?.[0]?.text;
    if (!text) return [];

    return text
      .split("\n")
      .map((line: string) => line.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    return [];
  }
}
