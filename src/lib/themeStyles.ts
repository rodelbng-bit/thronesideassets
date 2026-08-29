import type { ThemeCategory } from "./schema";

export type ThemeStyle = {
  label: string;
  /** One-line description shown under the theme selector. */
  blurb: string;
  /**
   * The detailed style brief — materials, palette, furniture archetypes,
   * lighting mood. Injected into the redesign edit prompt and into the
   * item-suggestion prompt, so tuning this steers every redesign for the
   * theme. Keep it to concrete nouns; avoid "modern"/"nice"/"stylish".
   */
  stylePrompt: string;
  /**
   * Reference images of the look, shown as a gallery when the theme is
   * picked. Any host allowed by next.config images.remotePatterns
   * (images.unsplash.com or *.public.blob.vercel-storage.com). Swap these
   * for your own curated shots or pre-generated example redesigns.
   */
  exampleImages: string[];
};

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1000&q=70&auto=format&fit=crop`;

export const THEME_STYLES: Record<ThemeCategory, ThemeStyle> = {
  natural: {
    label: "Natural",
    blurb: "Warm woods, linen and stone, plenty of greenery, soft daylight.",
    stylePrompt:
      "warm natural materials — oak, rattan and cane, linen and wool, jute " +
      "rugs, unglazed stoneware; an earthy palette of oatmeal, clay, sage " +
      "and warm white; abundant leafy potted plants; woven pendant shades; " +
      "soft diffused daylight; rounded organic shapes",
    exampleImages: [
      UNSPLASH("1772797583328-f83bc3f94f80"),
      UNSPLASH("1747336754870-ca7b10cc75f5"),
      UNSPLASH("1759722668087-efcc63c91ed2"),
    ],
  },
  urban: {
    label: "Urban",
    blurb: "Blackened steel and concrete, dark wood and leather — moody, industrial.",
    stylePrompt:
      "industrial-modern — blackened steel, concrete, reclaimed dark-stained " +
      "wood, tan and cognac leather; a charcoal and slate palette with rust " +
      "accents; low-slung modular seating; Edison-bulb and track lighting; " +
      "exposed, raw finishes; large monochrome graphic art",
    exampleImages: [
      UNSPLASH("1776090188612-a2dab458ce14"),
      UNSPLASH("1783990349147-906f62b882c1"),
      UNSPLASH("1776090188651-a1ec2cf2bdb0"),
    ],
  },
  classy: {
    label: "Classy",
    blurb: "Walnut and brass, marble, velvet in deep jewel tones — refined and tailored.",
    stylePrompt:
      "refined traditional-contemporary — walnut and dark oak, polished " +
      "brass, marble and stone; velvet and boucle upholstery; deep jewel " +
      "tones of emerald, navy and oxblood against cream; tailored sofas; a " +
      "statement chandelier and picture lights; gilt-framed art; layered rugs",
    exampleImages: [
      UNSPLASH("1700226034367-2fb120f48dfa"),
      UNSPLASH("1648881806148-e5c51179c826"),
      UNSPLASH("1745301558339-44eb3217d5da"),
    ],
  },
  abstract: {
    label: "Abstract",
    blurb: "Sculptural shapes, bold colour blocking and graphic art — playful, modern.",
    stylePrompt:
      "bold contemporary — sculptural, curved furniture; saturated colour " +
      "blocking in cobalt, ochre and coral; high-gloss and lacquer finishes; " +
      "large abstract and graphic canvases; playful geometric rugs; a " +
      "statement modern light fitting; a mix of matte and reflective surfaces",
    exampleImages: [
      UNSPLASH("1631510083755-11ecb5172d81"),
      UNSPLASH("1618221381711-42ca8ab6e908"),
      UNSPLASH("1615471618985-97108e2ba478"),
    ],
  },
};

export function getThemeStyle(theme: string): ThemeStyle | undefined {
  return THEME_STYLES[theme.trim().toLowerCase() as ThemeCategory];
}
