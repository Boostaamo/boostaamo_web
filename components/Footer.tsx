import Link from "next/link";
import { site } from "@/lib/site";
import ConsentReopen from "@/components/ConsentReopen";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <strong>{site.name}</strong>
          <ul className="nav">
            {site.footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            {process.env.NEXT_PUBLIC_GA_ID ? <li><ConsentReopen /></li> : null}
          </ul>
        </div>
        {site.boostaamoBadge && (
          <div className="ecosystem">
            <p><strong>A Boostaamo Company</strong></p>
            <p className="muted">Boostaamo-yhteisön yhtiöt:</p>
            <ul className="nav">
              {site.ecosystem.map((e) => (
                <li key={e.href}>
                  <a href={e.href} rel="noopener">{e.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </footer>
  );
}
