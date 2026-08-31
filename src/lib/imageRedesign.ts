import Replicate from "replicate";
import { getEnv } from "./env";

// Redesign pipeline, structure-preserving:
//   1. grounded_sam segments the movable furnishings (furniture, rugs,
//      art, plants, lamps, decor) into a mask.
//   2. flux-fill-pro inpaints ONLY that masked region in the new style —
//      walls, ceiling, floor, windows and doors stay pixel-identical.
//   3. If segmentation or inpainting fails, fall back to a whole-image
//      instruction edit with flux-kontext-max (structure "requested",
//      not locked).
const MASK_MODEL =
  "schananas/grounded_sam:ee871c19efb1941f55f66a3d7d960428c8a5afcb77449547fe8e5a3ab9ebc21c";
const INPAINT_MODEL = "black-forest-labs/flux-fill-pro";
const EDIT_MODEL = "black-forest-labs/flux-kontext-max";

// Things the redesign is allowed to change (grounded_sam positive prompt).
const CHANGEABLE =
  "sofa, couch, armchair, chair, dining chair, stool, bench, ottoman, " +
  "bed, headboard, coffee table, side table, end table, dining table, " +
  "desk, console table, dresser, chest of drawers, nightstand, cabinet, " +
  "sideboard, bookshelf, shelving unit, tv stand, rug, carpet, cushion, " +
  "pillow, throw blanket, curtain, blinds, floor lamp, table lamp, " +
  "pendant light, chandelier, potted plant, plant, vase, artwork, framed " +
  "picture, painting, poster, wall art, mirror, clock, decorative object, " +
  "ornament, sculpture, books, basket, tray, candle, television";

// Things it must not touch (grounded_sam negative prompt).
const KEEP =
  "wall, floor, flooring, ceiling, window, window frame, door, doorway, " +
  "door frame, skirting board, radiator, fireplace, staircase, stairs, " +
  "column, beam, pillar";

let client: Replicate | undefined;
function getClient(): Replicate {
  if (!client) {
    client = new Replicate({ auth: getEnv("REPLICATE_API_TOKEN") });
  }
  return client;
}

export type PromptItem = {
  name: string;
  description: string;
};

function piecesList(items: PromptItem[]): string {
  return items.length > 0
    ? items.slice(0, 8).map((item) => item.name).join(", ")
    : "a bed or sofa, chairs, tables, a rug, cushions, lamps and wall art";
}

function toUrl(item: unknown): string | null {
  if (typeof item === "string" && item) return item;
  const fn = (item as { url?: unknown } | null)?.url;
  if (typeof fn === "function") {
    const resolved = String(fn.call(item));
    return resolved || null;
  }
  return null;
}

function firstUrl(output: unknown): string {
  const url = toUrl(Array.isArray(output) ? output[0] : output);
  if (!url) throw new Error("Replicate returned no image.");
  return url;
}

// grounded_sam returns [annotated, neg_annotated, mask, inverted_mask];
// `mask` is white where the matched (changeable) objects are — exactly what
// flux-fill-pro wants white (= regenerate).
async function buildFurnitureMask(photoUrl: string): Promise<string | null> {
  try {
    const output = await getClient().run(MASK_MODEL, {
      input: {
        image: photoUrl,
        mask_prompt: CHANGEABLE,
        negative_mask_prompt: KEEP,
        adjustment_factor: 5,
      },
    });
    const arr = Array.isArray(output) ? output : [output];
    return toUrl(arr[2]);
  } catch (err) {
    console.error("Theme Room: furniture segmentation failed", err);
    return null;
  }
}

function inpaintPrompt(
  themePrompt: string,
  items: PromptItem[],
  styleBrief: string,
  roomLabel: string
): string {
  const brief = styleBrief ? ` ${styleBrief}.` : "";
  return (
    `Furnish this ${roomLabel} in a ${themePrompt} interior style: ${piecesList(items)}, ` +
    `plus matching rugs, cushions, wall art, plants, lamps and decorative ` +
    `pieces.${brief} Photorealistic, with lighting, shadows and perspective ` +
    `that match the rest of the room.`
  );
}

function editPrompt(
  themePrompt: string,
  items: PromptItem[],
  styleBrief: string,
  roomLabel: string
): string {
  const brief = styleBrief ? ` ${themePrompt} style means: ${styleBrief}.` : "";
  return (
    `Keep this ${roomLabel}'s architecture and structure completely ` +
    `unchanged: the walls and their positions, the windows, the doors and ` +
    `doorways, the floor, the ceiling, the room's shape and size, and the ` +
    `exact camera angle, position and framing must all stay identical. It ` +
    `must obviously be the same room. Change only the movable furnishings: ` +
    `replace ${piecesList(items)} with ${themePrompt}-style pieces, and ` +
    `restyle the rugs, cushions, wall art, plants, lamps and decorations to ` +
    `match.${brief} Do not add, remove or move any walls, windows or doors. ` +
    `Do not change the layout, the proportions or the perspective.`
  );
}

// Runs the redesign to completion server-side and returns the generated
// image URL. Callers should set `maxDuration` on their route handler.
export async function generateRedesign(
  photoUrl: string,
  themePrompt: string,
  items: PromptItem[] = [],
  styleBrief = "",
  roomLabel = "room"
): Promise<string> {
  const mask = await buildFurnitureMask(photoUrl);

  if (mask) {
    try {
      const output = await getClient().run(INPAINT_MODEL, {
        input: {
          image: photoUrl,
          mask,
          prompt: inpaintPrompt(themePrompt, items, styleBrief, roomLabel),
          output_format: "png",
          safety_tolerance: 2,
        },
      });
      return firstUrl(output);
    } catch (err) {
      console.error("Theme Room: inpaint failed, falling back to edit", err);
    }
  }

  const output = await getClient().run(EDIT_MODEL, {
    input: {
      prompt: editPrompt(themePrompt, items, styleBrief, roomLabel),
      input_image: photoUrl,
      aspect_ratio: "match_input_image",
      output_format: "png",
      safety_tolerance: 2,
    },
  });
  return firstUrl(output);
}
