import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, listSlugs } from "@/lib/content";
import { site } from "@/lib/site";
import LeadForm from "@/components/LeadForm";

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
    title: page.slug.length === 0 ? { absolute: page.meta.title } : page.meta.title,
    description: page.meta.description,
    alternates: { canonical: `${site.url}${path}` },
    robots: page.meta.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.meta.title,
      description: page.meta.description,
      url: `${site.url}${path}`,
    },
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug = [] } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <div className="container">
      <article className="prose" dangerouslySetInnerHTML={{ __html: page.html }} />
      {page.meta.form === "lead" && (
        <LeadForm source={slug.length ? slug.join("/") : "etusivu"} />
      )}
    </div>
  );
}
