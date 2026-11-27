"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { track } from "@/lib/analytics";

export type FormKind = "webinaari" | "yhteys" | "koulutus" | "purku";

type Status = "idle" | "sending" | "ok" | "error";

const LABELS: Record<FormKind, { submit: (arg?: string) => string; ok: string }> = {
  webinaari: { submit: (a) => `Ilmoittaudu ${dateLabel(a)} webinaariin`, ok: "Kiitos ilmoittautumisesta! Saat kalenterikutsun ja Meet-linkin sähköpostiisi." },
  yhteys: { submit: () => "Lähetä", ok: "Kiitos! Kasvuarkkitehti palaa asiaan viimeistään seuraavana arkipäivänä." },
  koulutus: { submit: () => "Pyydä koulutusta", ok: "Kiitos! Palaamme koulutuspyyntöösi pian." },
  purku: { submit: () => "Varaa purku", ok: "Kiitos! Kasvuarkkitehti ottaa yhteyttä purun ajankohdasta." },
};

// "2026-11-26 Otsikko" -> "26.11."
function dateLabel(arg?: string): string {
  const m = arg?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${Number(m[3])}.${Number(m[2])}.` : "";
}

function Field({ label, name, type = "text", required, autoComplete, textarea }: {
  label: string; name: string; type?: string; required?: boolean; autoComplete?: string; textarea?: boolean;
}) {
  const id = `${useId()}-${name}`;
  return (
    <label htmlFor={id} style={{ display: "grid", gap: 4 }}>
      <span className="mono" style={{ color: "#5E5959" }}>{label}{required ? " *" : ""}</span>
      {textarea
        ? <textarea id={id} name={name} rows={4} className="fld" maxLength={4000} />
        : <input id={id} name={name} type={type} className="fld" required={required} autoComplete={autoComplete} maxLength={200} />}
    </label>
  );
}

// Yhteydenoton aiheet. Sivujen painikkeet esitäyttävät aiheen osoitteella /yhteys?aihe=...
const AIHEET = [
  "Kasvukoneiston katsastus",
  "Pikakatsastus",
  "Syväkatsastus",
  "Johtoryhmäkoulutus",
  "Growth Board",
  "Muu asia",
];

function AiheValinta() {
  const id = useId();
  const [arvo, setArvo] = useState("");
  const [lisa, setLisa] = useState<string | null>(null);
  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get("aihe")?.trim().slice(0, 120) ?? "";
    if (!a) return;
    if (!AIHEET.includes(a)) setLisa(a);
    setArvo(a);
  }, []);
  return (
    <label htmlFor={id} style={{ display: "grid", gap: 4 }}>
      <span className="mono" style={{ color: "#5E5959" }}>Mistä haluat jutella?</span>
      <select id={id} name="topic" className="fld" value={arvo} onChange={(e) => setArvo(e.target.value)}>
        <option value="">Valitse aihe</option>
        {lisa ? <option value={lisa}>{lisa}</option> : null}
        {AIHEET.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
    </label>
  );
}

export default function Form({ kind, arg, source }: { kind: FormKind; arg?: string; source: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const g = (k: string) => (d.get(k) as string | null) ?? "";
    const q = new URLSearchParams(window.location.search);
    // Yhteydenotossa ja purussa riittää sähköposti tai puhelin, mutta toinen tarvitaan.
    if ((kind === "yhteys" || kind === "purku") && !g("email").trim() && g("phone").trim().length < 5) {
      setStatus("error");
      setError("Anna sähköpostiosoite tai puhelinnumero, jotta voimme vastata.");
      return;
    }
    const payload = {
      kind,
      webinar: arg ?? "",
      name: g("name"),
      company: g("company"),
      email: g("email"),
      phone: g("phone"),
      preferredTime: g("preferredTime"),
      topic: g("topic"),
      participants: g("participants"),
      message: g("message"),
      newsletter: d.get("newsletter") === "on",
      website: g("website"), // honeypot
      source,
      page: window.location.pathname,
      referrer: document.referrer,
      utm_source: q.get("utm_source") ?? "",
      utm_medium: q.get("utm_medium") ?? "",
      utm_campaign: q.get("utm_campaign") ?? "",
      utm_term: q.get("utm_term") ?? "",
      utm_content: q.get("utm_content") ?? "",
    };
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error || "Lähetys epäonnistui. Yritä uudelleen.");
        return;
      }
      setStatus("ok");
      form.reset();
      if (kind === "webinaari") track("sign_up", { method: "webinaari", webinaari: arg ?? "" });
      track("generate_lead", { form_source: source, form_kind: kind });
    } catch {
      setStatus("error");
      setError("Verkkovirhe. Yritä uudelleen.");
    }
  }

  const L = LABELS[kind];
  if (status === "ok") {
    return <p className="formok" role="status">{L.ok}</p>;
  }

  return (
    <form className="rform" onSubmit={onSubmit}>
      <Field label="Nimi" name="name" required autoComplete="name" />
      <Field label="Yritys" name="company" autoComplete="organization" />
      {(kind === "webinaari" || kind === "koulutus") && <Field label="Sähköposti" name="email" type="email" required autoComplete="email" />}
      {(kind === "yhteys" || kind === "purku") && (
        <>
          <p className="legal" style={{ margin: "4px 0 -6px" }}>Anna sähköposti tai puhelin (vähintään toinen) *</p>
          <Field label="Sähköposti" name="email" type="email" autoComplete="email" />
          <Field label="Puhelin" name="phone" type="tel" autoComplete="tel" />
          <Field label="Sopiva aika" name="preferredTime" />
        </>
      )}
      {kind === "yhteys" && <AiheValinta />}
      {kind === "yhteys" && <Field label="Mikä kasvua jarruttaa?" name="message" textarea />}
      {kind === "purku" && <Field label="Vapaa kenttä" name="message" textarea />}
      {kind === "koulutus" && (
        <>
          <Field label="Aihe" name="topic" />
          <Field label="Toivottu ajankohta" name="preferredTime" />
          <Field label="Osallistujamäärä" name="participants" type="number" />
        </>
      )}
      {kind === "webinaari" && (
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15 }}>
          <input type="checkbox" name="newsletter" style={{ width: 22, height: 22, marginTop: 3 }} /> Tilaan Boostaamon kvartaalikirjeen
        </label>
      )}
      <div className="hp" aria-hidden="true">
        <label>Älä täytä tätä kenttää<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <p className="legal">Henkilötiedot käsitellään <a href="/tietosuoja">tietosuojaselosteen</a> mukaisesti.</p>
      <button className="btn" type="submit" disabled={status === "sending"} style={{ fontFamily: "var(--font-otsikko)", cursor: "pointer", textAlign: "center" }}>
        {status === "sending" ? "Lähetetään…" : L.submit(arg)}
      </button>
      {status === "error" && <p className="ferr" role="alert">{error}</p>}
    </form>
  );
}
