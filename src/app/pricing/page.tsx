import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import { plans } from "@/lib/siteFacts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Membership Plans & Pricing",
  description:
    "Fixed 12-month memberships giving you the weekly deal sheet plus the guidance around it. Compare plans or book a call to find the right tier.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20 md:pt-28">
        <PageHero eyebrow="Membership" title="Choose your" accent="plan.">
          <p className="max-w-xl">
            Every plan is a fixed 12-month membership agreement — not a
            month-to-month subscription and not a per-deal fee — you get the
            weekly deal sheet plus the guidance around it, tailored to your
            package. Book a call and we&apos;ll walk you through current
            pricing and which tier fits.
          </p>
        </PageHero>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`card-lift enter relative flex flex-col overflow-hidden rounded-3xl border bg-ink-soft p-8 md:p-10 ${
                plan.comingSoon ? "rule" : "border-brass/50"
              }`}
              style={{ animationDelay: `${270 + i * 90}ms` }}
            >
              {!plan.comingSoon && (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brass to-brass-bright"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(255,117,24,0.18),transparent)]"
                  />
                </>
              )}

              <h2 className="relative font-display text-2xl text-paper">
                {plan.name}
              </h2>
              <p className="ledger-figure relative mt-4 text-4xl tracking-tight text-brass-bright">
                {plan.price}
              </p>
              {plan.term && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-paper-dim">
                  {plan.term}
                </p>
              )}
              {plan.priceNote && (
                <p className="mt-2 text-sm text-paper-dim">{plan.priceNote}</p>
              )}

              <ul className="mt-8 space-y-3 text-sm text-paper-dim">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <svg
                      viewBox="0 0 20 20"
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-brass"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 10.5l4 4 8-9" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-wrap gap-3 pt-10">
                {plan.comingSoon ? (
                  <span className="inline-block rounded-full border rule-strong px-7 py-3.5 text-sm font-semibold text-paper-dim">
                    Coming Soon
                  </span>
                ) : (
                  <Link
                    href="/join"
                    className="cta-glow group inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink hover:bg-brass-bright"
                  >
                    Register
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-paper-dim">
          Have questions first? See the{" "}
          <a
            href="/faq"
            className="font-medium text-brass-bright underline decoration-brass/50 underline-offset-4 hover:text-paper"
          >
            FAQ
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
