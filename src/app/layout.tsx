import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Figtree,
  Instrument_Serif,
} from "next/font/google";
import Providers from "@/components/Providers";
import MetaPixel from "@/components/MetaPixel";
import WelcomePopup from "@/components/WelcomePopup";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Headings and figures — characterful grotesque with optical sizing.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

// Italic accent for the highlighted phrase in a headline (`font-accent`).
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

// Site-wide defaults. No canonical/og:url here — those would be inherited by
// every page without its own metadata and point them all at the home page.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
  // Google Search Console ownership check (HTML tag method).
  verification: { google: "Z9QyoRL_1yyve0Wf4Esrhk9P81CJdG6JLRtrUixNVVE" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${bricolage.variable} ${figtree.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper">
        <Providers>
          {children}
          <WelcomePopup />
        </Providers>
        <MetaPixel />
      </body>
    </html>
  );
}
