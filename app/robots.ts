import type { MetadataRoute } from "next";
import { indeksoitava, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!indeksoitava) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
