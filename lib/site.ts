import raw from "@/content/site.json";

export type NavItem = { label: string; href: string };

export const site = {
  ...raw,
  // Ilman NEXT_PUBLIC_SITE_URL-muuttujaa käytetään Vercelin tuotanto-osoitetta, ei localhostia.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000"
  ).replace(/\/$/, ""),
} as typeof raw & { url: string };

export const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

/** Hakukoneisiin vain tuotanto omassa domainissa. Esikatselut ja *.vercel.app pysyvät noindex-tilassa. */
export const indeksoitava =
  isProduction && /^https:\/\//.test(site.url) && !/\.vercel\.app$|localhost/.test(site.url);
