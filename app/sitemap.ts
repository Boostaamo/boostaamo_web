import type { MetadataRoute } from "next";
import { getPage, listSlugs } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return listSlugs()
    .map((slug) => getPage(slug))
    .filter((p): p is NonNullable<typeof p> => !!p && !p.meta.noindex)
    .map((p) => ({
      url: `${site.url}${p.slug.length ? `/${p.slug.join("/")}` : ""}`,
      lastModified: p.meta.updated,
    }));
}
