import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { termsIntro, termsSections } from "@/lib/siteFacts";

export const metadata = {
  title: "Membership Terms & Conditions | Throneside Assets",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">THRONESIDE</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
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
