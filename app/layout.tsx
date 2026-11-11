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
import { isProduction, site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: { siteName: site.name, locale: site.locale, type: "website" },
  // Esikatselut ja kehitysympäristö pidetään pois hakukoneista
  robots: isProduction ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon.svg`,
  };
  return (
    <html lang="fi" suppressHydrationWarning>
      <body>
        {/* Väliaikainen: ilmeen vaihtoehtojen vertailu esikatselussa (?vaihtoehto=2). Poistetaan ennen julkaisua. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var q=location.search.match(/[?&]vaihtoehto=(\\d)/);if(q)sessionStorage.setItem('vaihtoehto',q[1]);if(sessionStorage.getItem('vaihtoehto')==='2')document.documentElement.classList.add('v2')}catch(e){}",
          }}
        />
        <a className="skip-link" href="#sisalto">Siirry sisältöön</a>
        <Header />
        <main id="sisalto">{children}</main>
        <Footer />
        <Analytics />
        <ClickTracker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
