import type { Metadata } from "next";
import ApplicationFlow from "@/components/funnel/ApplicationFlow";
import { Eyebrow, FunnelFooter, FunnelHeader, FunnelShell } from "@/components/funnel/FunnelParts";
import { attributionFromSearchParams } from "@/lib/attribution";
import { getFunnelAngle } from "@/lib/funnelContent";

// "Apply for Deal Access" questionnaire, reached from the /start CTAs.
// Carries the same ?v= / UTM params so attribution matches the landing page.
export const metadata: Metadata = {
  title: "Apply for Deal Access",
  robots: { index: false, follow: false },
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const angle = getFunnelAngle(typeof params.v === "string" ? params.v : undefined);
  const attribution = attributionFromSearchParams(params, `start-${angle.key}`);

  return (
    <FunnelShell>
      <FunnelHeader />
      <main className="relative flex-1 overflow-hidden font-sans">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.14),transparent)]"
        />
        <div className="relative mx-auto max-w-xl px-4 py-12 sm:px-6 md:py-20">
          <div className="text-center">
            <Eyebrow>Apply for deal access</Eyebrow>
            <p className="mx-auto mt-5 max-w-md text-paper-dim">
              A few quick questions so we can match you with the right
              opportunities — then pick a time to speak with our team.
            </p>
          </div>
          <div className="mt-10">
            <ApplicationFlow attribution={attribution} />
          </div>
        </div>
      </main>
      <FunnelFooter />
    </FunnelShell>
  );
}
