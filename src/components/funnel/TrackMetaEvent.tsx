"use client";

import { useEffect, useSyncExternalStore } from "react";
import { CONSENT_EVENT, getConsent, trackMetaEvent } from "@/lib/metaPixel";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

// Fires one Pixel event when the page is viewed — or as soon as the
// visitor accepts the cookie banner, if they hadn't yet.
export default function TrackMetaEvent({
  event,
  params,
}: {
  event: "ViewContent" | "Schedule";
  params?: Record<string, string>;
}) {
  const consent = useSyncExternalStore(subscribe, getConsent, () => null);
  const paramsKey = JSON.stringify(params ?? {});

  useEffect(() => {
    if (consent !== "granted") return;
    trackMetaEvent(event, JSON.parse(paramsKey));
  }, [consent, event, paramsKey]);

  return null;
}
