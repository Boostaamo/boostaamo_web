import raw from "@/content/site.json";

export type NavItem = { label: string; href: string };

export const site = {
  ...raw,
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
} as typeof raw & { url: string };

export const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";
