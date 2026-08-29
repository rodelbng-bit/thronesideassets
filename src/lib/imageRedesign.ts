import Replicate from "replicate";
import { getEnv } from "./env";

// black-forest-labs/flux-kontext-max: instruction-based image editing that
// changes only what it's told to and leaves the rest of the frame intact.
// "max" follows compound instructions more faithfully than "pro" — which
// matters here because the instruction is mostly "keep everything".
const MODEL = "black-forest-labs/flux-kontext-max";

let client: Replicate | undefined;
function getClient(): Replicate {
  if (!client) {
    client = new Replicate({ auth: getEnv("REPLICATE_API_TOKEN") });
  }
  return client;
}

export type PromptItem = {
  name: string;
  // Descriptive search-keywords text (already tuned by admins to describe
  // the item's look for shopping search) doubles as a decent generation
  // prompt fragment — avoids needing a separate description field.
  description: string;
};

function buildPrompt(
  themePrompt: string,
  items: PromptItem[],
  styleBrief: string
): string {
  const pieces =
    items.length > 0
      ? items.slice(0, 8).map((item) => item.name).join(", ")
      : "the bed, sofa, chairs, tables, rug, cushions, lamps and wall art";

  const brief = styleBrief ? ` ${themePrompt} style means: ${styleBrief}.` : "";

  // Lead with preservation, then the edit — Kontext holds structure much
  // better when "keep everything the same" comes first and the change is
  // scoped tightly to movable objects.
  return (
    `Keep this room's architecture and structure completely unchanged: the ` +
    `walls, the wall positions, the windows, the doors and doorways, the ` +
    `floor, the ceiling, the room's shape and size, and the exact camera ` +
    `angle, position and framing must all stay identical. The result must ` +
    `obviously be the same room, photographed from the same spot. ` +
    `Change only the movable furnishings: replace ${pieces} with ` +
    `${themePrompt}-style pieces, and restyle the rugs, cushions, wall art, ` +
    `plants, lamps and small decorations to match. You may repaint the wall ` +
    `surfaces a colour that suits the ${themePrompt} look, but keep the walls ` +
    `themselves exactly where they are.${brief} ` +
    `Do not add, remove or move any walls, windows or doors. Do not change ` +
    `the layout, the proportions or the perspective.`
  );
}

function extractUrl(output: unknown): string {
  const item = Array.isArray(output) ? output[0] : output;
  if (typeof item === "string" && item) return item;
  const urlFn = (item as { url?: unknown } | null)?.url;
  if (typeof urlFn === "function") {
    const resolved = String(urlFn.call(item));
    if (resolved) return resolved;
  }
  throw new Error("Replicate returned no image for this redesign.");
}

// Runs the redesign model to completion server-side (Replicate's `run`
// polls internally) and returns the generated image URL. Callers should
// set `maxDuration` on their route handler. `items` names the specific
// pieces to swap in; `styleBrief` (see lib/themeStyles) adds the theme's
// materials / palette / lighting.
export async function generateRedesign(
  photoUrl: string,
  themePrompt: string,
  items: PromptItem[] = [],
  styleBrief = ""
): Promise<string> {
  const output = await getClient().run(MODEL, {
    input: {
      prompt: buildPrompt(themePrompt, items, styleBrief),
      input_image: photoUrl,
      aspect_ratio: "match_input_image",
      output_format: "png",
      // Max permitted value when an input image is supplied.
      safety_tolerance: 2,
    },
  });
  return extractUrl(output);
}
