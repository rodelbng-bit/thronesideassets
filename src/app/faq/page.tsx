import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import ClosingCta from "@/components/ClosingCta";
import { faqs } from "@/lib/siteFacts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about Throneside Assets — fees, timelines, and the Rent-to-Rent Serviced Accommodation deals we source.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 md:pt-28">
          <PageHero eyebrow="FAQ" title="Common" accent="questions.">
            <p>
              Can&apos;t find what you&apos;re looking for?{" "}
              <a
                href="/contact"
                className="font-medium text-brass-bright underline decoration-brass/50 underline-offset-4 hover:text-paper"
              >
                Get in touch
              </a>{" "}
              and we&apos;ll answer directly.
            </p>
          </PageHero>

          <div className="mt-12 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="reveal group rounded-2xl border rule bg-ink-soft/60 px-6 py-5 transition-colors open:border-brass/40 open:bg-ink-soft hover:border-white/25"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-paper marker:content-none md:text-xl">
                  {item.q}
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brass/60 text-lg leading-none text-brass-bright transition-transform duration-300 group-open:rotate-45 group-open:bg-brass group-open:text-ink"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper-dim">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <ClosingCta
          title="Still deciding?"
          accent="Let's talk."
          body="Book a call with our UK team, or see what membership includes."
          secondary={{ href: "/pricing", label: "See Our Plans" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
