import type { Metadata } from "next";
import { Eyebrow, FunnelFooter, FunnelShell, FunnelHeader } from "@/components/funnel/FunnelParts";
import TrackMetaEvent from "@/components/funnel/TrackMetaEvent";
import { formatUkDateTime, getApplication } from "@/lib/applicationServer";

// Welcome page after the /start/apply questionnaire + booking (?id= is the
// application, used to show the call time). Also where the GHL booking
// widget redirects (Calendars → your calendar → Confirmation → Redirect
// URL), without an id. Fires the Pixel's Schedule event — the conversion
// the ads should optimise for.
export const metadata: Metadata = {
  title: "Welcome to Throneside",
  robots: { index: false, follow: false },
};

export default async function BookedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await searchParams;
  const application = typeof id === "string" ? await getApplication(id) : null;
  const appointmentAt = application?.appointmentAt ?? null;
  const firstName = application?.fullName.trim().split(/\s+/)[0];

  return (
    <FunnelShell>
      <FunnelHeader />
      <TrackMetaEvent event="Schedule" />

      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(255,117,24,0.16),transparent)]"
        />
        <div className="relative mx-auto w-full max-w-2xl px-6 py-20 text-center md:py-28">
          <div className="funnel-rise">
            <Eyebrow>{firstName ? `Welcome, ${firstName}` : "Welcome"}</Eyebrow>
          </div>

          <h1 className="font-funnel funnel-rise mt-8 text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-paper [animation-delay:80ms] sm:text-5xl md:text-6xl">
            You&apos;ve taken the first step in your Airbnb journey with{" "}
            <span className="text-brass">Throneside.</span>
          </h1>

          <p className="funnel-rise mx-auto mt-8 max-w-lg text-lg leading-relaxed text-paper-dim [animation-delay:160ms]">
            Starting is often the hardest part — and you&apos;ve done it.
            We&apos;re genuinely looking forward to learning about your goals
            and helping you find opportunities that fit them.
          </p>

          {appointmentAt && (
            <div className="funnel-rise gold-ring mx-auto mt-12 max-w-md rounded-2xl p-6 [animation-delay:240ms]">
              <p className="text-xs uppercase tracking-[0.18em] text-paper-dim">
                Your call
              </p>
              <p className="font-funnel mt-2 text-2xl font-semibold text-paper">
                {formatUkDateTime(appointmentAt)}
              </p>
              <p className="mt-1 text-sm text-paper-dim">UK time</p>
            </div>
          )}

          <p className="funnel-rise mt-12 text-sm text-paper-dim [animation-delay:320ms]">
            Speak soon — the Throneside team
          </p>
        </div>
      </main>

      <FunnelFooter />
    </FunnelShell>
  );
}
