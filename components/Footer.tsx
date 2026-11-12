import Link from "next/link";
import { site } from "@/lib/site";
import ConsentReopen from "@/components/ConsentReopen";

export default function Footer() {
  const email = site.contactEmail;
  const emailMissing = email.includes("täydennä");
  return (
    <footer className="foot" id="yhtiot-alatunniste">
      <div className="wrap">
        <div className="wm" style={{ color: "#EDE9E9" }}>BOOSTAAMO</div>
        <div className="mono" style={{ marginTop: 8 }}><span className="dot" />A Boostaamo Company</div>
        <div className="fcols">
          <div>
            <div className="mono">Yhtiöt</div>
            <ul>
              {site.companies.map((c) => (
                <li key={c.href}><Link href={c.href} data-track="click_yhtio" data-yhtio={c.id}>{c.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mono">Sivusto</div>
            <ul>
              {site.siteLinks.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
              {process.env.NEXT_PUBLIC_GA_ID ? <li><ConsentReopen /></li> : null}
            </ul>
          </div>
          <div>
            <div className="mono">Yhteys</div>
            <ul>
              <li><Link href="/yhteys">Ota yhteyttä</Link></li>
              <li>
                {emailMissing
                  ? <span className="todo" style={{ color: "#0C0C0D" }}>&lt;täydennä: julkinen sähköposti&gt;</span>
                  : <a href={`mailto:${email}`}>{email}</a>}
              </li>
              {site.contactPhone ? <li><a href={`tel:${site.contactPhone.replace(/\s/g, "")}`}>{site.contactPhone}</a></li> : null}
            </ul>
          </div>
        </div>
        <p className="small" style={{ marginTop: 32 }}>Rekisterinpitäjä: {site.legalEntity}.</p>
      </div>
    </footer>
  );
}
