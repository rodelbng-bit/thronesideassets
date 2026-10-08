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
  SOCIAL_LINKS,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

// Organization + WebSite structured data — helps search engines show the
// brand name, logo and site name in results and tie the social profiles to
// the business.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description:
        "We source, analyse, and deliver Rent-to-Rent Serviced Accommodation deals in Manchester and Leeds.",
      areaServed: "GB",
      sameAs: SOCIAL_LINKS.map((link) => link.href),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
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
