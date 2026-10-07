import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import JoinForm from "@/components/JoinForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Join the Essential Plan",
  description:
    "Join Throneside Assets in a couple of minutes — choose how you'd like to be billed and pay securely by card with Stripe.",
  path: "/join",
});

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-20 md:pt-28">
        <PageHero
          eyebrow="Essential"
          title="Join in a"
          accent="couple of minutes."
        >
          <p>
            Choose how you&apos;d like to be billed, then pay securely by card
            with Stripe. You&apos;ll set your password right after.
          </p>
        </PageHero>

        <div className="enter mt-10 rounded-3xl border rule p-6 [animation-delay:270ms] md:p-8">
          <JoinForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
