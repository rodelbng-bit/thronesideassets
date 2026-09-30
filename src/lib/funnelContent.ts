// Content for the /start ad funnel. Everything marked TODO is a
// placeholder: the page renders it as an obviously-unfinished dashed box
// rather than as real copy, so nothing here should be mistaken for real
// business facts. Fill these in before pointing ad spend at /start.

export type FunnelVideo = {
  /**
   * YouTube/Vimeo *embed* URL (e.g. https://www.youtube.com/embed/<id>,
   * https://player.vimeo.com/video/<id>) or a direct .mp4 URL.
   * null renders a placeholder slot.
   */
  url: string | null;
  /** Cover image shown before the video plays (.mp4 only). */
  poster?: string;
  /** What the placeholder slot tells whoever is filming. */
  brief: string;
};

export type FunnelAngle = {
  eyebrow: string;
  headline: string;
  subhead: string;
};

// Ad-angle headlines, chosen with /start?v=<key>. Match each ad's hook to
// its landing-page headline — e.g. an ad about off-market deals links to
// /start?v=off-market&utm_campaign=... . Unknown keys fall back to
// "default", the Airbnb-investor angle.
export const funnelAngles: Record<string, FunnelAngle> = {
  default: {
    eyebrow: "FOR AIRBNB INVESTORS",
    headline: "We Have Your Next Airbnb Deal — And The Ones After That.",
    subhead:
      "Build Your Profit. We source high-potential rental properties and analyse the numbers, helping you find opportunities designed to cover costs and generate positive cash flow.",
  },
  // TODO: add one entry per ad angle once the video hooks are scripted, e.g.
  // "off-market": { eyebrow: "...", headline: "...", subhead: "..." },
};

export function getFunnelAngle(key: string | undefined): FunnelAngle & { key: string } {
  const resolved = key && funnelAngles[key] ? key : "default";
  return { key: resolved, ...funnelAngles[resolved] };
}

export const landingVideo: FunnelVideo = {
  // 3 min walkthrough, compressed for the web (Vercel Blob).
  url: "https://hjlcfh9zpan2wk8m.public.blob.vercel-storage.com/funnel/landing-video-UIMfXUlFw6tOU7swJIy2EsUsBjVYHo.mp4",
  poster:
    "https://hjlcfh9zpan2wk8m.public.blob.vercel-storage.com/funnel/landing-video-poster-fFGwNuc0iWsGwkNp5sA94h8RvVOX2a.jpg",
  brief:
    "1–3 min: who you are, what a profitable Airbnb / serviced accommodation deal looks like, how we find and analyse them, and why book a call.",
};

export const bookedVideo: FunnelVideo = {
  url: null, // TODO
  brief:
    "30–60 sec: thanks for booking, who they'll speak to, and what to have ready — cuts no-shows.",
};

// Proof section — deal examples, results, testimonials. Leave empty until
// you have real, approved items; the page shows a placeholder instead.
export const funnelProof: { quote: string; name: string; detail?: string }[] = [];

// "What to prepare for the call" on /start/booked. Empty = placeholder.
export const callPrepChecklist: string[] = [];
