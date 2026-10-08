import { Fragment } from "react";
import type { Metadata } from "next";
import {
  Eyebrow,
  FunnelFooter,
  FunnelHeader,
  FunnelShell,
  FunnelVideo,
} from "@/components/funnel/FunnelParts";
import TrackMetaEvent from "@/components/funnel/TrackMetaEvent";
import DealCard from "@/components/DealCard";
import { getFeaturedDeals } from "@/lib/deals";
import { attributionFromSearchParams } from "@/lib/attribution";
import { funnelProof, getFunnelAngle, landingVideo } from "@/lib/funnelContent";
import { faqs } from "@/lib/siteFacts";

// Ad landing page — not linked from the site nav and kept out of search,
// so its traffic (and conversion rate) is purely paid/social.
export const metadata: Metadata = {
  title: "Find Airbnb Property Opportunities",
  description:
    "Find Properties. Run the Numbers. Build Your Profit. We source high-potential rental properties and analyse the numbers — book a call with our team.",
  robots: { index: false, follow: false },
};

const CTA_LABEL = "Apply for Deal Access";

const steps = [
  {
    n: "01",
    title: "We Source & Pre-Qualify the Deals",
    body: "We source properties through our private network of landlords and agents. Every deal is pre-qualified for Rent-to-Rent Serviced Accommodation and comes with the key numbers and analysis already completed for you.",
    icon: "M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
  },
  {
    n: "02",
    title: "Browse the Deals",
    body: "New opportunities are uploaded weekly, giving you access to an unlimited pipeline of properties. Browse the available deals and choose the ones that fit your requirements and strategy.",
    icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  },
  {
    n: "03",
    title: "View the Property",
    body: "Found a property you like? Arrange a viewing if you want to see it in person. If you're happy with the information and content provided, you can move forward without a viewing.",
    icon: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  },
  {
    n: "04",
    title: "Proceed With the Landlord",
    body: "The landlord or agent is already aware of and open to the Serviced Accommodation/Rent-to-Rent model, so you don't have to approach them to request permission to sublet. Once you're happy with the opportunity, you can proceed to the legal stage.",
    icon: "M5 12.5l4.5 4.5L19 7",
  },
  {
    n: "05",
    title: "Sign, Pay & Launch",
    body: "Complete the necessary agreements with the landlord, pay the agreed rent and deposit (where applicable), and begin setting up your Serviced Accommodation. Your only cost to us is your Throneside membership — no hidden costs or transaction fees.",
    icon: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  },
];

// Restates the steps above as quick scannable points — no new claims.
const highlights = [
  "UK rental properties, sourced for you",
  "Full profit & loss on every deal",
  "No obligation to proceed",
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
  const [headlineLead, headlineAccent] = splitLastSentence(angle.headline);
  const [subheadLead, subheadRest] = splitFirstSentence(angle.subhead);
  const applyHref = `/start/apply${queryString(params)}`;
  const featuredDeals = await getFeaturedDeals();

  return (
    <FunnelShell>
      <FunnelHeader cta={{ href: applyHref, label: CTA_LABEL }} />
      <TrackMetaEvent event="ViewContent" params={{ content_name: attribution.funnel! }} />

      <main className="font-sans">
        {/* Hero */}
        <section className="relative overflow-hidden border-b rule">
          <div aria-hidden className="funnel-grid absolute inset-0" />
          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(255,117,24,0.18),transparent)]"
          />

          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 text-center md:pb-28 md:pt-24">
            <div className="funnel-rise">
              <Eyebrow>{angle.eyebrow}</Eyebrow>
            </div>

            <h1 className="font-funnel funnel-rise mx-auto mt-8 max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.035em] text-paper [animation-delay:80ms] sm:text-6xl md:text-7xl lg:text-8xl">
              {headlineLead}{" "}
              {headlineAccent && <span className="text-gold">{headlineAccent}</span>}
            </h1>

            <p className="funnel-rise mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-paper-dim [animation-delay:160ms] md:text-xl">
              <span className="font-semibold text-paper">{subheadLead}</span>
              {subheadRest && ` ${subheadRest}`}
            </p>

            <div className="funnel-rise mt-10 flex flex-col items-center justify-center gap-4 [animation-delay:240ms] sm:flex-row">
              <PrimaryCta href={applyHref} />
              <a
                href="#how-it-works"
                className="rounded-full border rule-strong px-8 py-4 text-base font-medium text-paper transition-colors hover:bg-white/5"
              >
                How it works
              </a>
            </div>

            <ul className="funnel-rise mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-paper-dim [animation-delay:320ms]">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <div className="funnel-rise mt-16 w-full text-left [animation-delay:400ms] md:mt-20">
              <FunnelVideo video={landingVideo} title="Throneside Assets — how it works" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-b rule">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="text-center">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="font-funnel mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-[-0.03em] text-paper md:text-5xl">
                From first search to <span className="text-gold">final numbers.</span>
              </h2>
            </div>

            {/* All five in one row on large screens with a gold arrow between
                each; stacked with downward arrows on phones and tablets. */}
            <ol className="mx-auto mt-14 flex max-w-md flex-col lg:max-w-none lg:flex-row">
              {steps.map((step, i) => (
                <Fragment key={step.n}>
                  <li className="group relative min-w-0 flex-1 overflow-hidden rounded-2xl border rule bg-ink-soft p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brass/50 hover:shadow-[0_20px_60px_-20px_rgba(255,117,24,0.35)] lg:p-5">
                    <span
                      aria-hidden
                      className="font-funnel pointer-events-none absolute -right-2 -top-4 text-[5rem] font-extrabold leading-none text-white/[0.03] transition-colors group-hover:text-brass/10"
                    >
                      {step.n}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-ink">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d={step.icon} />
                      </svg>
                    </span>
                    <p className="ledger-figure mt-5 text-sm text-brass-bright">{step.n}</p>
                    <h3 className="font-funnel mt-1 text-lg font-semibold leading-snug tracking-tight text-paper">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                      {step.body}
                    </p>
                  </li>

                  {i < steps.length - 1 && (
                    <li aria-hidden className="flex shrink-0 items-center justify-center py-2 text-brass-bright lg:px-2 lg:py-0">
                      <svg viewBox="0 0 40 24" className="h-6 w-9 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12h34M29 5l7 7-7 7" />
                      </svg>
                    </li>
                  )}
                </Fragment>
              ))}
            </ol>
          </div>
        </section>

        {/* Deals — hidden until at least one deal has a walkthrough video */}
        {featuredDeals.length > 0 && (
          <section id="deals" className="scroll-mt-20 border-b rule">
            <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
              <div className="text-center">
                <Eyebrow>Recent deals</Eyebrow>
                <h2 className="font-funnel mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-[-0.03em] text-paper md:text-5xl">
                  See the <span className="text-gold">numbers for yourself.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-paper-dim">
                  Some of the latest properties our team has sourced and
                  analysed. Tap a video to watch the walkthrough.
                </p>
              </div>

              {/* Three across on large screens; stacked on phones and tablets. */}
              <div className="mx-auto mt-14 grid max-w-md grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
                {featuredDeals.map((deal) => (
                  <div key={deal.id} className="flex flex-col">
                    {deal.status === "unavailable" && (
                      <p className="ledger-figure mb-3 text-xs uppercase tracking-[0.18em] text-paper-dim">
                        Reserved — no longer available
                      </p>
                    )}
                    <div className="flex-1">
                      <DealCard deal={deal} compact />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-14 text-center">
                <PrimaryCta href={applyHref} />
              </div>
            </div>
          </section>
        )}

        {/* Proof — hidden until there are real, approved items in
            funnelProof (src/lib/funnelContent.ts). */}
        {funnelProof.length > 0 && (
          <section className="border-b rule">
            <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
              <div className="text-center">
                <Eyebrow>Results</Eyebrow>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                {funnelProof.map((item) => (
                  <figure key={item.name} className="gold-ring rounded-2xl p-8">
                    <blockquote className="text-lg text-paper">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-5 text-sm text-paper-dim">
                      <span className="font-semibold text-paper">{item.name}</span>
                      {item.detail && ` · ${item.detail}`}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Booking */}
        <section id="qualify" className="relative scroll-mt-20 overflow-hidden border-b rule">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,117,24,0.12),transparent)]"
          />
          <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
            <div className="text-center">
              <Eyebrow>Get started</Eyebrow>
              <h2 className="font-funnel mt-6 text-4xl font-bold tracking-[-0.03em] text-paper md:text-5xl">
                Let&apos;s find your <span className="text-gold">next property.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-paper-dim">
                Answer a few quick questions, then pick a time to talk through
                Airbnb property opportunities with our UK team.
              </p>
              <div className="mt-10">
                <PrimaryCta href={applyHref} />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <div className="text-center">
              <Eyebrow>Questions</Eyebrow>
              <h2 className="font-funnel mt-6 text-4xl font-bold tracking-[-0.03em] text-paper md:text-5xl">
                Good to know.
              </h2>
            </div>
            <div className="mt-12 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border rule bg-ink-soft px-6 transition-colors open:border-brass/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-medium text-paper [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border rule-strong text-brass-bright transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-6 text-sm leading-relaxed text-paper-dim">
                    {/* No plans section on this page to point at. */}
                    {faq.a.replace(" See the plans above for full details.", "")}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-16 text-center">
              <PrimaryCta href={applyHref} />
            </div>
          </div>
        </section>
      </main>

      <FunnelFooter />
    </FunnelShell>
  );
}

function PrimaryCta({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="bg-gold group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(255,117,24,0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-10px_rgba(255,117,24,0.9)]"
    >
      {CTA_LABEL}
      <span aria-hidden className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-brass-bright" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// "Find Properties. Run the Numbers." → ["Find Properties.", "Run the Numbers."]
// so the last sentence can be set in gold. An em dash also counts as a
// break: "Deal — And The Ones After That." → ["Deal —", "And The Ones After That."]
function splitLastSentence(text: string): [string, string] {
  const parts = text.split(/(?<=[.—])\s+/);
  if (parts.length < 2) return [text, ""];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
}

function splitFirstSentence(text: string): [string, string] {
  const [first, ...rest] = text.split(/(?<=\.)\s+/);
  return [first, rest.join(" ")];
}

// Carries ?v= and the ad's UTM/fbclid params through to /start/apply so
// the application keeps its campaign attribution.
function queryString(params: { [key: string]: string | string[] | undefined }) {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") out.set(key, value);
  }
  const qs = out.toString();
  return qs ? `?${qs}` : "";
}
