"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

/** Päävalikko: nykyinen sivu korostetaan Growth Boardin välilehtien tapaan.
 *  Kapealla näytöllä valikko avautuu Valikko-painikkeesta, jotta yläpalkki pysyy matalana. */
export default function NavLinks({ items, cta }: { items: Item[]; cta: Item }) {
  const path = usePathname() || "/";
  const [auki, setAuki] = useState(false);

  useEffect(() => {
    setAuki(false);
  }, [path]);

  useEffect(() => {
    if (!auki) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAuki(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [auki]);

  return (
    <>
      <button
        type="button"
        className="menubtn"
        aria-expanded={auki}
        aria-controls="paavalikko"
        onClick={() => setAuki((a) => !a)}
      >
        <span aria-hidden="true" className={`menuikoni${auki ? " x" : ""}`}><span /><span /><span /></span>
        {auki ? "Sulje" : "Valikko"}
      </button>
      <div id="paavalikko" className={`navpanel${auki ? " auki" : ""}`}>
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
        <Link className="btn" href={cta.href}>{cta.label}</Link>
      </div>
    </>
  );
}
