import type { ThemeCategory } from "./schema";
import type { RoomType } from "./roomTypes";

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
   * Reference images of the look, shown as a gallery once both a room type
   * and a theme are picked — 3 per room type, so the member sees the style
   * applied to the specific room they're about to redesign. Any host
   * allowed by next.config images.remotePatterns (images.unsplash.com or
   * *.public.blob.vercel-storage.com). Swap these for your own curated
   * shots or pre-generated example redesigns.
   */
  exampleImagesByRoom: Record<RoomType, string[]>;
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
    exampleImagesByRoom: {
      bedroom: [
        UNSPLASH("1718717621302-a359be21a111"),
        UNSPLASH("1631020280892-02a11b5e960a"),
        UNSPLASH("1712628837571-7c42f4c80387"),
      ],
      "living-room": [
        UNSPLASH("1772797583328-f83bc3f94f80"),
        UNSPLASH("1617228133035-2347f159e755"),
        UNSPLASH("1728649054288-61f332ee389b"),
      ],
      kitchen: [
        UNSPLASH("1565538810643-b5bdb714032a"),
        UNSPLASH("1628797285815-453c1d0d21e3"),
        UNSPLASH("1609347744403-2306e8a9ae27"),
      ],
      "dining-room": [
        UNSPLASH("1600488999806-8efb986d87b1"),
        UNSPLASH("1564586880927-99376cbf0f4f"),
        UNSPLASH("1752004028694-72610be3604e"),
      ],
    },
  },
  urban: {
    label: "Urban",
    blurb: "Blackened steel and concrete, dark wood and leather — moody, industrial.",
    stylePrompt:
      "industrial-modern — blackened steel, concrete, reclaimed dark-stained " +
      "wood, tan and cognac leather; a charcoal and slate palette with rust " +
      "accents; low-slung modular seating; Edison-bulb and track lighting; " +
      "exposed, raw finishes; large monochrome graphic art",
    exampleImagesByRoom: {
      bedroom: [
        UNSPLASH("1524061614234-8449637d36ce"),
        UNSPLASH("1583221742001-9ad88bf233ff"),
        UNSPLASH("1704428382583-c9c7c1e55d94"),
      ],
      "living-room": [
        UNSPLASH("1505873242700-f289a29e1e0f"),
        UNSPLASH("1650091009622-4cbe6def4d2e"),
        UNSPLASH("1650090974911-94b90ea2a833"),
      ],
      kitchen: [
        UNSPLASH("1589109807644-924edf14ee09"),
        UNSPLASH("1588416820614-f8d6ac6cea56"),
        UNSPLASH("1724627559517-a0e5a2096760"),
      ],
      "dining-room": [
        UNSPLASH("1650091722991-fde645dd72a6"),
        UNSPLASH("1783990349147-906f62b882c1"),
        UNSPLASH("1560185007-5f0bb1866cab"),
      ],
    },
  },
  classy: {
    label: "Classy",
    blurb: "Walnut and brass, marble, velvet in deep jewel tones — refined and tailored.",
    stylePrompt:
      "refined traditional-contemporary — walnut and dark oak, polished " +
      "brass, marble and stone; velvet and boucle upholstery; deep jewel " +
      "tones of emerald, navy and oxblood against cream; tailored sofas; a " +
      "statement chandelier and picture lights; gilt-framed art; layered rugs",
    exampleImagesByRoom: {
      bedroom: [
        UNSPLASH("1616594039964-ae9021a400a0"),
        UNSPLASH("1578683010236-d716f9a3f461"),
        UNSPLASH("1560185893-a55cbc8c57e8"),
      ],
      "living-room": [
        UNSPLASH("1564078516393-cf04bd966897"),
        UNSPLASH("1598928506311-c55ded91a20c"),
        UNSPLASH("1618221195710-dd6b41faaea6"),
      ],
      kitchen: [
        UNSPLASH("1722605090433-41d1183a792d"),
        UNSPLASH("1682888813913-e13f18692019"),
        UNSPLASH("1610276099118-c929abaaa80a"),
      ],
      "dining-room": [
        UNSPLASH("1634389312178-50613e56acda"),
        UNSPLASH("1706820229870-f9a8c6dac193"),
        UNSPLASH("1704040686487-a39bb894fc93"),
      ],
    },
  },
  abstract: {
    label: "Abstract",
    blurb: "Sculptural shapes, bold colour blocking and graphic art — playful, modern.",
    stylePrompt:
      "bold contemporary — sculptural, curved furniture; saturated colour " +
      "blocking in cobalt, ochre and coral; high-gloss and lacquer finishes; " +
      "large abstract and graphic canvases; playful geometric rugs; a " +
      "statement modern light fitting; a mix of matte and reflective surfaces",
    exampleImagesByRoom: {
      bedroom: [
        UNSPLASH("1603072387986-d6136328c664"),
        UNSPLASH("1763616310394-b8ed0a3318c4"),
        UNSPLASH("1749878064888-54901e874956"),
      ],
      "living-room": [
        UNSPLASH("1631510083755-11ecb5172d81"),
        UNSPLASH("1618221381711-42ca8ab6e908"),
        UNSPLASH("1650137938625-11576502aecd"),
      ],
      kitchen: [
        UNSPLASH("1652911678853-335318b9d816"),
        UNSPLASH("1652918320907-f9ec8623ab30"),
        UNSPLASH("1765421619212-372b859dadf5"),
      ],
      "dining-room": [
        UNSPLASH("1758803995776-8c33cbee4c25"),
        UNSPLASH("1783444130687-b0f0db3d3a47"),
        UNSPLASH("1680131273996-529cc8bbdad6"),
      ],
    },
  },
};

export function getThemeStyle(theme: string): ThemeStyle | undefined {
  return THEME_STYLES[theme.trim().toLowerCase() as ThemeCategory];
}
