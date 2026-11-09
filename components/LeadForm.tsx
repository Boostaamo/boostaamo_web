"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";

type Status = "idle" | "sending" | "ok" | "error";

export default function LeadForm({ source }: { source: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams(window.location.search);

    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company"),
      message: data.get("message"),
      consent: data.get("consent") === "on",
      website: data.get("website"), // honeypot
      source,
      page: window.location.pathname,
      referrer: document.referrer,
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "",
      utm_term: params.get("utm_term") ?? "",
      utm_content: params.get("utm_content") ?? "",
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
      track("generate_lead", { form_source: source });
    } catch {
      setStatus("error");
      setError("Verkkovirhe. Yritä uudelleen.");
    }
  }

  if (status === "ok") {
    return (
      <p className="notice" role="status">
        Kiitos! Olemme sinuun yhteydessä pian.
      </p>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">Nimi *</label>
        <input id="name" name="name" type="text" autoComplete="name" required maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="email">Sähköposti *</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="company">Yritys</label>
        <input id="company" name="company" type="text" autoComplete="organization" maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="message">Viesti</label>
        <textarea id="message" name="message" rows={5} maxLength={4000} />
      </div>
      {/* Honeypot: piilotettu oikeilta käyttäjiltä */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Älä täytä tätä kenttää</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field checkbox">
        <input id="consent" name="consent" type="checkbox" required />
        <label htmlFor="consent">
          Hyväksyn, että tietojani käsitellään yhteydenottoa varten.{" "}
          <a href="/tietosuoja">Tietosuojaseloste</a> *
        </label>
      </div>
      <button className="button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Lähetetään…" : "Lähetä"}
      </button>
      {status === "error" && (
        <p className="error" role="alert">{error}</p>
      )}
    </form>
  );
}
