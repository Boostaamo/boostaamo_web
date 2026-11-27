import type { Metadata } from "next";
import "@fontsource/archivo/latin-500.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-800.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import ClickTracker from "@/components/ClickTracker";
import { indeksoitava, isProduction, site } from "@/lib/site";
import Vanhentuvat from "@/components/Vanhentuvat";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: { siteName: site.name, locale: site.locale, type: "website" },
  twitter: { card: "summary_large_image" },
  // Esikatselut, *.vercel.app ja kehitysympäristö pidetään pois hakukoneista
  robots: indeksoitava ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    email: site.contactEmail,
    telephone: site.contactPhone,
    sameAs: site.sameAs,
  };
  return (
    <html lang="fi">
      <body className={isProduction ? "tuotanto" : undefined}>
        <a className="skip-link" href="#sisalto">Siirry sisältöön</a>
        <Header />
        <main id="sisalto">{children}</main>
        <Footer />
        <Analytics />
        <ClickTracker />
        <Vanhentuvat />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
