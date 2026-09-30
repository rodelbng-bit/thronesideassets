import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import PropertyShowcase from "@/components/PropertyShowcase";
import AboutFeatures from "@/components/AboutFeatures";
import MarketActivity from "@/components/MarketActivity";
import Framework from "@/components/Framework";
import ClosingCta from "@/components/ClosingCta";
import SiteFooter from "@/components/SiteFooter";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

// Organization structured data — helps search engines show the brand name
// and logo in results.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "We source, analyse, and deliver off-market property investment opportunities across the UK.",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SiteHeader />
      <main>
        <Hero />
        <PropertyShowcase />
        <AboutFeatures />
        <MarketActivity />
        <Framework />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
