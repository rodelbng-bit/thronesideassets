import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import CallScreenerFlow from "@/components/CallScreenerFlow";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book a Call",
  description:
    "Book a call with the Throneside Assets UK team. Answer a few quick questions, then pick a time that works for you.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-20 md:pt-28">
        <PageHero
          eyebrow="Get in touch"
          title="Book a call with our"
          accent="UK team."
        >
          <p>
            A few quick questions first so we can prepare for the call — then
            pick a time that works for you.
          </p>
        </PageHero>

        <div className="enter mt-10 rounded-3xl border rule p-6 [animation-delay:270ms] md:p-8">
          <CallScreenerFlow />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
