import Link from "next/link";
import { site } from "@/lib/site";
import NavLinks from "@/components/NavLinks";

export default function Header() {
  return (
    <header className="top">
      <nav className="nav" aria-label="Päävalikko" style={{ maxWidth: 1168, margin: "0 auto" }}>
        <Link className="wm" href="/">BOOSTAAMO</Link>
        <NavLinks items={site.nav} cta={site.cta} />
      </nav>
    </header>
  );
}
