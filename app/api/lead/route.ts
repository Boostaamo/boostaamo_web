import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
// Huom: serverless-ympäristössä tämä muisti nollautuu. Se hidastaa roskaa, ei korvaa varsinaista suojausta.
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Liian suuri pyyntö." }, { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Liian monta lähetystä. Yritä myöhemmin uudelleen." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Virheellinen pyyntö." }, { status: 400 });
  }

  // Honeypot: oikeat käyttäjät eivät täytä tätä kenttää. Vastataan onnistuneesti, ettei botti opi.
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const kinds = ["webinaari", "yhteys", "koulutus", "purku"];
  const kind = kinds.includes(str(body.kind, 20)) ? str(body.kind, 20) : "yhteys";
  const name = str(body.name, 200);
  const email = str(body.email, 200);
  const phone = str(body.phone, 60);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name) {
    return NextResponse.json({ ok: false, error: "Kirjoita nimesi." }, { status: 400 });
  }
  // Webinaari ja koulutus tarvitsevat sähköpostin. Yhteydenotossa ja purussa riittää sähköposti tai puhelin.
  const needsEmail = kind === "webinaari" || kind === "koulutus";
  if (needsEmail ? !emailOk : !emailOk && phone.length < 5) {
    return NextResponse.json(
      { ok: false, error: needsEmail ? "Tarkista sähköpostiosoite." : "Anna sähköpostiosoite tai puhelinnumero." },
      { status: 400 },
    );
  }
  if (email && !emailOk) {
    return NextResponse.json({ ok: false, error: "Tarkista sähköpostiosoite." }, { status: 400 });
  }

  const lead = {
    kind,
    webinar: str(body.webinar, 200),
    name,
    email,
    phone,
    company: str(body.company, 200),
    message: str(body.message, 4000),
    preferredTime: str(body.preferredTime, 200),
    topic: str(body.topic, 200),
    participants: str(body.participants, 20),
    // Kvartaalikirje: erillinen, oletuksena pois päältä oleva valinta
    newsletter: body.newsletter === true,
    // Lomakkeella on tietosuojaselosteen mukainen ilmoitus (ei erillistä suostumusruutua)
    privacyNoticeShown: true,
    source: str(body.source, 100),
    page: str(body.page, 300),
    referrer: str(body.referrer, 300),
    utm: {
      source: str(body.utm_source, 100),
      medium: str(body.utm_medium, 100),
      campaign: str(body.utm_campaign, 100),
      term: str(body.utm_term, 100),
      content: str(body.utm_content, 100),
    },
    receivedAt: new Date().toISOString(),
  };

  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    // Ei lokiteta henkilötietoja
    console.error("LEAD_WEBHOOK_URL puuttuu: liidiä ei voitu lähettää.");
    return NextResponse.json({ ok: false, error: "Lomake ei ole juuri nyt käytössä." }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.LEAD_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      console.error(`Liidin lähetys epäonnistui, tila ${res.status}.`);
      return NextResponse.json({ ok: false, error: "Lähetys epäonnistui. Yritä myöhemmin uudelleen." }, { status: 502 });
    }
  } catch {
    console.error("Liidin lähetys epäonnistui (verkkovirhe).");
    return NextResponse.json({ ok: false, error: "Lähetys epäonnistui. Yritä myöhemmin uudelleen." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
