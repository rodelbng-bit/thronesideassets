import { getEnv } from "./env";

// Asks Claude for a list of generic UK furniture/decor shopping search
// queries that fit a given interior style. Used to pad out the redesign's
// shopping list beyond whatever's been curated in the admin catalog, so
// even a thin theme still produces a full set of clickable items. Returns
// [] on any failure so the redesign flow still succeeds with just the
// curated items (or none).
export async function suggestThemeItemQueries(
  theme: string,
  count = 8
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
        model: "claude-haiku-4-5",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content:
              `List ${count} short UK furniture/decor shopping search queries ` +
              `(e.g. "rattan pendant light", "linen scatter cushion", "oak ` +
              `coffee table") for a living room styled in this way: ` +
              `"${theme}". Cover a range — seating, tables, lighting, wall art, ` +
              `cushions, rugs, and other decoration. Reply with ONLY the ` +
              `${count} queries, one per line, no numbering or extra text.`,
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
      .slice(0, count);
  } catch {
    return [];
  }
}
