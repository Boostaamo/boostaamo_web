import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");

export type PageMeta = {
  title: string;
  description?: string;
  form?: "lead";
  noindex?: boolean;
  updated?: string;
};

export type Page = { slug: string[]; meta: PageMeta; html: string };

function walk(dir: string, prefix: string[] = []): string[][] {
  const out: string[][] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      out.push(...walk(path.join(dir, entry.name), [...prefix, entry.name]));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const name = entry.name.slice(0, -3);
      out.push(name === "index" ? prefix : [...prefix, name]);
    }
  }
  return out;
}

export function listSlugs(): string[][] {
  return walk(PAGES_DIR);
}

function fileFor(slug: string[]): string | null {
  if (slug.some((s) => !/^[a-z0-9-]+$/i.test(s))) return null;
  const direct = path.join(PAGES_DIR, ...slug) + ".md";
  const index = path.join(PAGES_DIR, ...slug, "index.md");
  if (slug.length > 0 && fs.existsSync(direct)) return direct;
  if (fs.existsSync(index)) return index;
  return null;
}

export function getPage(slug: string[]): Page | null {
  const file = fileFor(slug);
  if (!file) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const meta = data as PageMeta;
  if (!meta.title) {
    throw new Error(`Sivulta ${path.relative(process.cwd(), file)} puuttuu title-kenttä.`);
  }
  const html = marked.parse(content, { async: false }) as string;
  return { slug, meta, html };
}
