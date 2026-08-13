import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import PropertyShowcase from "@/components/PropertyShowcase";
import AboutFeatures from "@/components/AboutFeatures";
import MarketActivity from "@/components/MarketActivity";
import Framework from "@/components/Framework";
import ClosingCta from "@/components/ClosingCta";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
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
