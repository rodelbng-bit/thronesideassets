import type { Metadata } from "next";
import Link from "next/link";
import {
  FunnelFooter,
  FunnelHeader,
  FunnelVideo,
  PlaceholderSlot,
} from "@/components/funnel/FunnelParts";
import TrackMetaEvent from "@/components/funnel/TrackMetaEvent";
import { bookedVideo, callPrepChecklist } from "@/lib/funnelContent";

// Where the GHL booking calendar redirects after a booking (set in GHL:
// Calendars → your calendar → Confirmation → Redirect URL). Fires the
// Pixel's Schedule event — the conversion the ads should optimise for.
export const metadata: Metadata = {
  title: "You're Booked In",
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return (
    <>
      <FunnelHeader />
      <TrackMetaEvent event="Schedule" />

      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          STEP 2 OF 2 — COMPLETE
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          You&apos;re booked in.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Thanks for booking. Watch the short video below before we speak.
        </p>

        <div className="mt-10">
          <FunnelVideo video={bookedVideo} title="Before your call" />
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl text-paper">
            Before the call
          </h2>
          {callPrepChecklist.length === 0 ? (
            <PlaceholderSlot label="CALL PREP" className="mt-6">
              What should they have ready — budget confirmation, preferred
              areas, strategy questions? Add items to{" "}
              <span className="ledger-figure">callPrepChecklist</span> in{" "}
              <span className="ledger-figure">src/lib/funnelContent.ts</span>.
            </PlaceholderSlot>
          ) : (
            <ol className="mt-6 space-y-4">
              {callPrepChecklist.map((item, i) => (
                <li key={item} className="flex gap-4">
                  <span className="ledger-figure text-sm text-brass-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-paper-dim">{item}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="mt-14 border-t rule pt-8">
          <Link
            href="/deals"
            className="text-sm text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
          >
            In the meantime, browse the kind of deals we source →
          </Link>
        </div>
      </main>

      <FunnelFooter />
    </>
  );
}
