import Replicate from "replicate";
import { getEnv } from "./env";

// Instruction-based image editing on Replicate that changes only what it's
// told to and leaves the rest of the frame intact.
//   - MULTI_MODEL: takes the member's room + a per-theme style reference and
//     matches the room to the reference's look (see lib/themeStyles).
//   - MODEL: single-image fallback when a theme has no reference set, or if
//     the multi-image run fails.
const MULTI_MODEL = "flux-kontext-apps/multi-image-kontext-max";
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

const PRESERVE =
  "the exact same room shape and size, the same walls, windows, doors and " +
  "doorways in the same places, the same floor, the same ceiling, and the " +
  "same camera angle, viewpoint and framing as the original photo. Do not " +
  "add, remove or move any walls, windows or doors. Do not change the room's " +
  "architecture, proportions or perspective";

function piecesList(items: PromptItem[]): string {
  return items.length > 0
    ? items.slice(0, 8).map((item) => item.name).join(", ")
    : "the bed, sofa, chairs, tables, rug, cushions, lamps and wall art";
}

function singleImagePrompt(
  themePrompt: string,
  items: PromptItem[],
  styleBrief: string
): string {
  const brief = styleBrief
    ? ` The ${themePrompt} look means: ${styleBrief}.`
    : "";
  return (
    `Replace the furniture and decoration in this room with ${themePrompt}-style ` +
    `pieces — swap ${piecesList(items)} for versions that fit a ${themePrompt} ` +
    `interior, repaint the walls in a colour that suits the ${themePrompt} look, ` +
    `and change the wall art, plants and small decor to match.${brief} ` +
    `Keep everything else identical: ${PRESERVE}.`
  );
}

function referencePrompt(
  themePrompt: string,
  items: PromptItem[],
  styleBrief: string
): string {
  const brief = styleBrief
    ? ` The ${themePrompt} look means: ${styleBrief}.`
    : "";
  return (
    `The first image is a room to redesign. The second image is a style ` +
    `reference only. Restyle the room in the first image to match the ` +
    `furniture, materials, decoration and colour palette of the second image, ` +
    `in a ${themePrompt} interior style — swap ${piecesList(items)} for pieces ` +
    `in that style, repaint the walls to suit it, and update the wall art, ` +
    `plants and small decor to match.${brief} ` +
    `Keep the first image's room exactly as it is otherwise: ${PRESERVE}. Do ` +
    `not take the layout, room shape, architecture or perspective from the ` +
    `second image.`
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
// materials / palette / lighting; `referenceImageUrl`, when set, gives the
// model a visual target for the look.
export async function generateRedesign(
  photoUrl: string,
  themePrompt: string,
  items: PromptItem[] = [],
  styleBrief = "",
  referenceImageUrl = ""
): Promise<string> {
  if (referenceImageUrl) {
    try {
      const output = await getClient().run(MULTI_MODEL, {
        input: {
          prompt: referencePrompt(themePrompt, items, styleBrief),
          input_image_1: photoUrl,
          input_image_2: referenceImageUrl,
          aspect_ratio: "match_input_image",
          output_format: "png",
          safety_tolerance: 2,
        },
      });
      return extractUrl(output);
    } catch (err) {
      // Don't fail the whole redesign over the reference-image path — fall
      // back to the single-image edit.
      console.error(
        "Theme Room: multi-image redesign failed, using single-image",
        err
      );
    }
  }

  const output = await getClient().run(MODEL, {
    input: {
      prompt: singleImagePrompt(themePrompt, items, styleBrief),
      input_image: photoUrl,
      aspect_ratio: "match_input_image",
      output_format: "png",
      // Max permitted value when an input image is supplied.
      safety_tolerance: 2,
    },
  });
  return extractUrl(output);
}
