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

// Runs the redesign model to completion server-side (Replicate's `run`
// polls internally) and returns the generated image URL. Callers should
// set `maxDuration` on their route handler — a run typically takes
// 10–30s.
export async function generateRedesign(
  photoUrl: string,
  themePrompt: string
): Promise<string> {
  const output = await getClient().run(MODEL_VERSION, {
    input: {
      image: photoUrl,
      prompt: `${themePrompt} interior design style`,
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
