// Browser-side Meta Pixel helpers. The Pixel itself only loads once the
// visitor accepts the cookie banner (UK PECR treats ad pixels as
// non-essential) — see src/components/MetaPixel.tsx. Every helper here is
// a safe no-op before that, or when NEXT_PUBLIC_META_PIXEL_ID is unset.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

const CONSENT_KEY = "ts-tracking-consent";
export const CONSENT_EVENT = "ts-tracking-consent-change";

export type ConsentChoice = "granted" | "denied";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export function getConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Storage blocked — the choice still applies for this page view.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

export function hasTrackingConsent() {
  return !!META_PIXEL_ID && getConsent() === "granted";
}

/** Standard Meta base-code snippet, run once consent is granted. */
export function loadMetaPixel() {
  if (!META_PIXEL_ID || window.fbq) return;

  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", META_PIXEL_ID);
}

export function trackMetaEvent(
  eventName: "PageView" | "ViewContent" | "Lead" | "Schedule",
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (!hasTrackingConsent()) return;
  // Page-level effects can run before MetaPixel's, so load on demand.
  loadMetaPixel();
  window.fbq?.("track", eventName, params ?? {}, eventId ? { eventID: eventId } : undefined);
}

/** The _fbp browser-id cookie the Pixel sets, for server-side matching. */
export function getFbp() {
  return document.cookie.match(/(?:^|; )_fbp=([^;]+)/)?.[1];
}

/** Meta's click-id format, built from the ad's ?fbclid= parameter. */
export function buildFbc(fbclid: string | undefined) {
  if (!fbclid) return document.cookie.match(/(?:^|; )_fbc=([^;]+)/)?.[1];
  return `fb.1.${Date.now()}.${fbclid}`;
}
