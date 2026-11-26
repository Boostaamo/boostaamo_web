"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

/** Päävalikon linkit: nykyinen sivu merkitään Growth Boardin välilehtien tapaan. */
export default function NavLinks({ items }: { items: Item[] }) {
  const path = usePathname() || "/";
  return (
    <ul>
      {items.map((item) => {
        const on = item.href === "/" ? path === "/" : path === item.href || path.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link href={item.href} aria-current={on ? "page" : undefined}>{item.label}</Link>
          </li>
        );
      })}
    </ul>
  );
}
