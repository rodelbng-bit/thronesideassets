import Replicate from "replicate";
import { getEnv } from "./env";

// adirik/interior-design: img2img model that redesigns a room photo into a
// given style while roughly preserving the original layout. Pinned version
// hash — Replicate model versions are immutable, so bump this deliberately
// if a newer version is adopted.
const MODEL_VERSION =
  "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38";

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

// Terms that push the model away from altering the room's structure — the
// user wants a restyle, not a different room.
const NEGATIVE_PROMPT =
  "different room layout, changed architecture, moved walls, added walls, " +
  "removed walls, changed window position, changed door position, new windows, " +
  "new doors, different perspective, different camera angle, different room shape, " +
  "distorted proportions, warped walls, structural changes, extra rooms, " +
  "lowres, watermark, banner, logo, contactinfo, text, deformed, blurry, blur, " +
  "out of focus, out of frame, surreal, extra, ugly, upholstered walls, " +
  "fabric walls, plush walls, mirror, mirrored";

// How much the img2img pass is allowed to deviate from the source. The
// default (0.8) redraws enough of the frame to shift the room's geometry;
// 0.6 keeps the layout, windows, and perspective recognisably the same
// while still fully restyling surfaces and furniture.
const PROMPT_STRENGTH = 0.6;

function buildPrompt(themePrompt: string, items: PromptItem[]): string {
  const preserve =
    "Keep the exact same room layout, wall and window positions, doorways, " +
    "ceiling, floor plan, proportions, and camera angle as the original photo. " +
    "Only restyle the furniture, wall colour and finish, decorations, rugs, " +
    "lighting fixtures, and wall art.";

  if (items.length === 0) {
    return `${themePrompt} interior design style. ${preserve}`;
  }
  // The model's text encoder only takes in a short prompt before truncating,
  // so keep the furniture list tight — the first handful of pieces steer the
  // render; the full shopping list still comes back to the client.
  const itemList = items
    .slice(0, 6)
    .map((item) =>
      items.length > 4 ? item.name : `${item.name} (${item.description})`
    )
    .join(", ");
  return (
    `${themePrompt} interior design style. ${preserve} Furnish it with pieces ` +
    `like: ${itemList}.`
  );
}

// Runs the redesign model to completion server-side (Replicate's `run`
// polls internally) and returns the generated image URL. Callers should
// set `maxDuration` on their route handler — a run typically takes
// 10–30s. `items`, when given, steers the generation toward specific
// catalog pieces via their text description — the model only takes one
// image + a prompt, so this can't literally insert the product photos,
// just nudge the imagined furniture to resemble them.
export async function generateRedesign(
  photoUrl: string,
  themePrompt: string,
  items: PromptItem[] = []
): Promise<string> {
  const output = await getClient().run(MODEL_VERSION, {
    input: {
      image: photoUrl,
      prompt: buildPrompt(themePrompt, items),
      negative_prompt: NEGATIVE_PROMPT,
      prompt_strength: PROMPT_STRENGTH,
    },
  });

  // The model returns a single output, or an array with one entry — and
  // the replicate client (v1.4+) wraps file outputs in a FileOutput
  // stream object with a .url() method rather than a plain string.
  const item = Array.isArray(output) ? output[0] : output;
  const url =
    typeof item === "string"
      ? item
      : typeof item?.url === "function"
        ? item.url().toString()
        : null;
  if (!url) {
    throw new Error("Replicate returned no image for this redesign.");
  }
  return url;
}
