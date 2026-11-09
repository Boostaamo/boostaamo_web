import Link from "next/link";
import { site } from "@/lib/site";

export default function Header() {
  return (
    <header className="top">
      <nav className="nav" aria-label="Päävalikko" style={{ maxWidth: 1168, margin: "0 auto" }}>
        <Link className="wm" href="/">BOOSTAAMO</Link>
        <ul>
          {site.nav.map((item) => (
            <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
          ))}
        </ul>
        <Link className="btn" href={site.cta.href}>{site.cta.label}</Link>
      </nav>
    </header>
  );
}
