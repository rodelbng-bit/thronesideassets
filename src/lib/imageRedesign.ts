import Replicate from "replicate";
import { getEnv } from "./env";

// black-forest-labs/flux-kontext-pro: instruction-based image editing that
// changes only what it's told to and leaves the rest of the frame intact —
// the right tool for "swap the furniture, keep the room". Official Replicate
// model, addressed by name (no pinned version hash).
const MODEL = "black-forest-labs/flux-kontext-pro";

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

function buildPrompt(themePrompt: string, items: PromptItem[]): string {
  const pieces =
    items.length > 0
      ? items.slice(0, 8).map((item) => item.name).join(", ")
      : "the bed, sofa, chairs, tables, rug, cushions, lamps and wall art";

  return (
    `Replace the furniture and decoration in this room with ${themePrompt}-style ` +
    `pieces — swap ${pieces} for versions that fit a ${themePrompt} interior, ` +
    `repaint the walls in a colour that suits the ${themePrompt} look, and change ` +
    `the wall art, plants and small decor to match. ` +
    `Keep everything else identical: the exact same room shape and size, the same ` +
    `walls, windows, doors and doorways in the same places, the same floor, the ` +
    `same ceiling, and the same camera angle, viewpoint and framing as the ` +
    `original photo. Do not add, remove or move any walls, windows or doors. Do ` +
    `not change the room's architecture, proportions or perspective.`
  );
}

// Runs the redesign model to completion server-side (Replicate's `run`
// polls internally) and returns the generated image URL. Callers should
// set `maxDuration` on their route handler. `items`, when given, names the
// specific pieces to swap in so the edit targets them by name.
export async function generateRedesign(
  photoUrl: string,
  themePrompt: string,
  items: PromptItem[] = []
): Promise<string> {
  const output = await getClient().run(MODEL, {
    input: {
      prompt: buildPrompt(themePrompt, items),
      input_image: photoUrl,
      aspect_ratio: "match_input_image",
      output_format: "png",
      // Max permitted value when an input image is supplied.
      safety_tolerance: 2,
    },
  });

  // The model returns a single image URL — the replicate client (v1.4+)
  // wraps file outputs in a FileOutput object with a .url() method rather
  // than a plain string.
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
