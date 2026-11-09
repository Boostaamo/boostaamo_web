import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, listSlugs } from "@/lib/content";
import { site } from "@/lib/site";
import type { FormKind } from "@/components/Form";
import FormPortals, { type FormSlot } from "@/components/FormPortals";

export const dynamicParams = false;

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = getPage(slug);
  if (!page) return {};
  const path = slug.length ? `/${slug.join("/")}` : "/";
  return {
    title: slug.length === 0 ? { absolute: page.meta.title } : page.meta.title,
    description: page.meta.description,
    alternates: { canonical: `${site.url}${path}` },
    robots: page.meta.noindex ? { index: false, follow: false } : undefined,
    openGraph: { title: page.meta.title, description: page.meta.description, url: `${site.url}${path}` },
  };
}

// Sisältö on HTML-lohkoja. Lomakkeet merkitään kommentilla <!--form:tyyppi|arvo-->,
// ne korvataan paikkamerkillä ja renderöidään Reactilla (FormPortals).
function prepare(html: string): { html: string; slots: FormSlot[] } {
  const slots: FormSlot[] = [];
  const out = html.replace(/<!--form:([a-z]+)(?:\|([^>]*?))?-->/g, (_m, kind: string, arg?: string) => {
    const id = `lomake-${slots.length}`;
    slots.push({ id, kind: kind as FormKind, arg });
    return `<div id="${id}"></div>`;
  });
  return { html: out, slots };
}

export default async function ContentPage({ params }: Props) {
  const { slug = [] } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  const path = slug.length ? `/${slug.join("/")}` : "/";
  const source = slug.length ? slug.join("/") : "etusivu";

  const { html, slots } = prepare(page.html);

  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.meta.title,
      description: page.meta.description,
      url: `${site.url}${path}`,
      isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    },
  ];
  if (slug.length > 0) {
    const crumbs = [{ name: "Etusivu", url: site.url }];
    slug.forEach((_, i) => {
      const sub = slug.slice(0, i + 1);
      const p = i === slug.length - 1 ? page : getPage(sub);
      if (p) crumbs.push({ name: p.meta.title, url: `${site.url}/${sub.join("/")}` });
    });
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
    });
  }

  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />
      <FormPortals slots={slots} source={source} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
