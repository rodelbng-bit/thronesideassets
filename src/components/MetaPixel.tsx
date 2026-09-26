"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CONSENT_EVENT,
  META_PIXEL_ID,
  getConsent,
  loadMetaPixel,
  setConsent,
  trackMetaEvent,
  type ConsentChoice,
} from "@/lib/metaPixel";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

// Loads the Meta Pixel site-wide (so ad audiences can retarget any page
// visit) but only after the visitor accepts; renders the consent banner
// until they choose. Renders nothing when no Pixel ID is configured.
export default function MetaPixel() {
  const pathname = usePathname();
  // undefined during SSR/hydration, so the banner never flashes for
  // visitors who already chose.
  const consent = useSyncExternalStore<ConsentChoice | null | undefined>(
    subscribe,
    getConsent,
    () => undefined
  );

  useEffect(() => {
    if (consent !== "granted") return;
    loadMetaPixel();
    trackMetaEvent("PageView");
  }, [consent, pathname]);

  if (!META_PIXEL_ID || consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t rule bg-ink-soft/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-paper-dim">
          We&apos;d like to use Meta advertising cookies to measure our ads
          and show you relevant ones. Nothing is set unless you accept.{" "}
          <Link
            href="/terms"
            className="underline decoration-paper-dim/40 underline-offset-4 hover:text-paper"
          >
            Terms
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="rounded-full border rule-strong px-5 py-2 text-sm text-paper-dim transition-colors hover:text-paper"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => setConsent("granted")}
            className="rounded-full bg-brass px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
