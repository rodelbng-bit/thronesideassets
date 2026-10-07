import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { termsIntro, termsSections } from "@/lib/siteFacts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Membership Terms & Conditions",
  description:
    "The terms and conditions of a Throneside Assets membership.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className="eyebrow">THRONESIDE</p>
        <h1 className="enter mt-4 font-display text-4xl text-paper [animation-delay:90ms] md:text-5xl">
          Membership Terms & Conditions
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-paper-dim">
          {termsIntro}
        </p>

        <div className="mt-12 space-y-10 border-t rule pt-10">
          {termsSections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl text-paper">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p}
                  className="mt-4 max-w-2xl text-sm leading-relaxed text-paper-dim"
                >
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-paper-dim">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {section.trailingParagraphs?.map((p) => (
                <p
                  key={p}
                  className="mt-4 max-w-2xl text-sm leading-relaxed text-paper-dim"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-16 text-sm text-paper-dim">
          Questions about these Terms?{" "}
          <a href="/contact" className="text-brass-bright hover:text-paper">
            Get in touch
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
