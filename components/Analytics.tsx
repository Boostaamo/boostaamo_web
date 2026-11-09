"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const KEY = "consent-analytics";

type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeConsent(v: "granted" | "denied") {
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* tallennus ei onnistu (esim. yksityinen selaus); valinta pätee vain tämän istunnon */
  }
}

export default function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setOpen(c === null && /^G-[A-Z0-9]+$/.test(GA_ID));
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener("consent:open", reopen);
    return () => window.removeEventListener("consent:open", reopen);
  }, []);

  const valid = /^G-[A-Z0-9]+$/.test(GA_ID);
  if (!ready || !valid) return null;

  const choose = (v: "granted" | "denied") => {
    writeConsent(v);
    setConsent(v);
    setOpen(false);
    if (v === "denied") window.location.reload(); // poistaa jo ladatun seurannan
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {open && (
        <div className="consent" role="dialog" aria-labelledby="consent-title" aria-live="polite">
          <p id="consent-title"><strong>Evästeet</strong></p>
          <p>
            Käytämme analytiikkaevästeitä sivuston kehittämiseen. Voit sallia tai kieltää ne.
            Lisätietoja <a href="/tietosuoja">tietosuojaselosteesta</a>.
          </p>
          <div className="consent-actions">
            <button type="button" className="button" onClick={() => choose("granted")}>Hyväksy</button>
            <button type="button" className="button secondary" onClick={() => choose("denied")}>Vain välttämättömät</button>
          </div>
        </div>
      )}
    </>
  );
}
