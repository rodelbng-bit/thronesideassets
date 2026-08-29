import { getEnv } from "./env";

export type ItemPoint = { x: number; y: number };

// Asks Claude (vision) roughly where each named item sits in the generated
// redesign so the UI can pin a "where to buy" marker on it. Coordinates are
// fractional — x: 0 (left) to 1 (right), y: 0 (top) to 1 (bottom). Items the
// model can't see are omitted. Returns {} on any failure (no API key, bad
// response, network error) so the redesign flow still succeeds — the caller
// just falls back to the plain "Shop this look" list with no markers.
export async function locateItemsInImage(
  imageUrl: string,
  itemNames: string[]
): Promise<Record<string, ItemPoint>> {
  if (itemNames.length === 0) return {};

  let apiKey: string;
  try {
    apiKey = getEnv("ANTHROPIC_API_KEY");
  } catch {
    return {};
  }

  const list = itemNames.map((n) => `- ${n}`).join("\n");

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
        max_tokens: 600,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "url", url: imageUrl },
              },
              {
                type: "text",
                text:
                  `This is a photo of a styled room. For each item below, give the ` +
                  `fractional coordinates of its centre in the image — x from 0 ` +
                  `(left edge) to 1 (right edge), y from 0 (top edge) to 1 (bottom ` +
                  `edge).\n\nItems:\n${list}\n\nReply with ONLY a JSON array, no ` +
                  `other text. Each element: {"name": <exact item name>, "x": ` +
                  `<number 0-1 or null>, "y": <number 0-1 or null>}. Use null for ` +
                  `both when the item is not visibly present in the image.`,
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return {};

    const data = await res.json();
    const text: string | undefined = data?.content?.[0]?.text;
    if (!text) return {};

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) return {};

    const parsed: unknown = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    if (!Array.isArray(parsed)) return {};

    const known = new Set(itemNames);
    const points: Record<string, ItemPoint> = {};
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const { name, x, y } = entry as Record<string, unknown>;
      if (
        typeof name === "string" &&
        known.has(name) &&
        typeof x === "number" &&
        typeof y === "number" &&
        x >= 0 &&
        x <= 1 &&
        y >= 0 &&
        y <= 1
      ) {
        points[name] = { x, y };
      }
    }
    return points;
  } catch {
    return {};
  }
}
