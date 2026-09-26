import type { Metadata } from "next";
import CallScreenerFlow from "@/components/CallScreenerFlow";
import {
  FunnelFooter,
  FunnelHeader,
  FunnelVideo,
  PlaceholderSlot,
} from "@/components/funnel/FunnelParts";
import TrackMetaEvent from "@/components/funnel/TrackMetaEvent";
import { attributionFromSearchParams } from "@/lib/attribution";
import { funnelProof, getFunnelAngle, landingVideo } from "@/lib/funnelContent";
import { faqs } from "@/lib/siteFacts";

// Ad landing page — not linked from the site nav and kept out of search,
// so its traffic (and conversion rate) is purely paid/social.
export const metadata: Metadata = {
  title: "Book a Call",
  description:
    "Vetted UK property deals, delivered every week. Answer a few quick questions and book a call with our team.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    n: "01",
    title: "We Source",
    body: "We're in network with landlords and agents across the UK, surfacing deals before they're widely listed.",
  },
  {
    n: "02",
    title: "We Analyse",
    body: "Every deal gets a full financial breakdown — yield, expenses, profit and loss — checked against real demand data. If the numbers don't hold up, it doesn't go out.",
  },
  {
    n: "03",
    title: "You Decide",
    body: "You review a vetted opportunity and the numbers behind it. There's never an obligation to proceed on any deal we show you.",
  },
];

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const angle = getFunnelAngle(
    typeof params.v === "string" ? params.v : undefined
  );
  const attribution = attributionFromSearchParams(params, `start-${angle.key}`);

  return (
    <>
      <FunnelHeader />
      <TrackMetaEvent event="ViewContent" params={{ content_name: attribution.funnel! }} />

      <main>
        <section className="border-b rule">
          <div className="mx-auto max-w-5xl px-6 pb-16 pt-14 md:pt-20">
            <p className="ledger-figure text-sm text-brass-bright">
              {angle.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-paper md:text-6xl">
              {angle.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-paper-dim">
              {angle.subhead}
            </p>

            <div className="mt-10">
              <FunnelVideo video={landingVideo} title="Throneside Assets — how it works" />
            </div>

            <a
              href="#qualify"
              className="mt-10 inline-block rounded-full bg-brass px-8 py-4 text-base font-medium text-ink transition-colors hover:bg-brass-bright"
            >
              See if you qualify →
            </a>
          </div>
        </section>

        <section className="border-b rule">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="ledger-figure text-sm text-brass-bright">
              HOW IT WORKS
            </p>
            <ol className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <li key={step.n} className="border-l-2 border-ledger-green pl-6">
                  <span className="ledger-figure text-sm text-paper-dim">
                    {step.n}
                  </span>
                  <h2 className="mt-2 font-display text-2xl text-paper">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b rule">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="ledger-figure text-sm text-brass-bright">
              RESULTS
            </p>
            {funnelProof.length === 0 ? (
              <PlaceholderSlot label="PROOF" className="mt-8">
                Real deal examples, member results or testimonials you&apos;re
                approved to publish. Add them to{" "}
                <span className="ledger-figure">funnelProof</span> in{" "}
                <span className="ledger-figure">src/lib/funnelContent.ts</span>.
              </PlaceholderSlot>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {funnelProof.map((item) => (
                  <figure
                    key={item.name}
                    className="rounded-lg border rule bg-ink-soft p-6"
                  >
                    <blockquote className="text-paper">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-sm text-paper-dim">
                      {item.name}
                      {item.detail && ` · ${item.detail}`}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="qualify" className="scroll-mt-6 border-b rule">
          <div className="mx-auto max-w-2xl px-6 py-16">
            <p className="ledger-figure text-sm text-brass-bright">
              STEP 1 OF 2
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-paper md:text-4xl">
              See if you qualify.
            </h2>
            <p className="mt-4 text-paper-dim">
              A few quick questions so we can prepare — then pick a time for
              your call with our UK team.
            </p>
            <div className="mt-10">
              <CallScreenerFlow
                attribution={attribution}
                submitLabel="Continue to step 2: book your call"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="ledger-figure text-sm text-brass-bright">
              QUESTIONS
            </p>
            <dl className="mt-8 divide-y divide-[var(--rule)] border-y rule">
              {faqs.map((faq) => (
                <div key={faq.q} className="py-6">
                  <dt className="font-display text-lg text-paper">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-paper-dim">
                    {/* No plans section on this page to point at. */}
                    {faq.a.replace(" See the plans above for full details.", "")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <FunnelFooter />
    </>
  );
}
