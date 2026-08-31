import { getEnv } from "./env";

// Asks Claude (vision) for a short, concrete description of one specific
// reference photo the member picked out of the 3 shown for their chosen
// style + room — materials, colours, furniture pieces, layout. Appended to
// the theme's general style brief so the generation prompt leans toward
// this particular look, not just the style category on average. Returns ""
// on any failure (no API key, bad response, network error) so the redesign
// flow still succeeds with just the base style brief.
export async function describeReferenceLook(imageUrl: string): Promise<string> {
  let apiKey: string;
  try {
    apiKey = getEnv("ANTHROPIC_API_KEY");
  } catch {
    return "";
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
        max_tokens: 200,
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
                  "This is a reference photo of a room's interior styling that " +
                  "someone picked as their preferred look. In 1-2 concise " +
                  "sentences, describe its specific materials, colours, " +
                  "furniture pieces and layout using concrete nouns (e.g. " +
                  "\"a low walnut bed frame, a bouclé armchair in oatmeal, a " +
                  "brass floor lamp\") — this text gets appended after another " +
                  "sentence describing the general style, so don't restate " +
                  "generic style words like \"modern\" or \"stylish\", and write " +
                  "it so it reads naturally as a continuation. Reply with ONLY " +
                  "those 1-2 sentences, no preamble.",
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return "";

    const data = await res.json();
    const text: string | undefined = data?.content?.[0]?.text;
    return text?.trim() ?? "";
  } catch {
    return "";
  }
}
