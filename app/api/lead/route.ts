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

  const name = str(body.name, 200);
  const email = str(body.email, 200);
  const company = str(body.company, 200);
  const message = str(body.message, 4000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Tarkista nimi ja sähköpostiosoite." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ ok: false, error: "Hyväksy tietojen käsittely lähettääksesi lomakkeen." }, { status: 400 });
  }

  const lead = {
    name,
    email,
    company,
    message,
    consent: true,
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
