"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OSAT, LAHTOTASO, vahentaaLiiketta } from "@/components/elementit/osat";

// Ehdotus A: Pullonkaula. Työ virtaa kasvukoneiston kuuden osan läpi. Kapein osa
// rajaa koko virran, ja jono kertyy sen eteen. Kun osa korjataan, pullonkaula siirtyy.

type Hiukkanen = { s: number; y: number; v: number };

const HIILI = "#0C0C0D";
const HEHKU = "#FFB000";
const HIUS = "#E2DDDD";
const HARMAA = "#5E5959";
const VALI = 9; // hiukkasten vähimmäisväli (px)
const NOPEUS = 120; // px/s
const LAHDE = 3.2; // hiukkasta sekunnissa, kun kapasiteetti on 1

// Yhtiösivuilla yhtiön oma osa korostetaan yhtiön värillä ja se on lähtötilanteen pullonkaula.
const YHTIOT: Record<string, { osa: number; nimi: string; vari: string }> = {
  gfc: { osa: 0, nimi: "Growth Flame Company", vari: "#182A50" },
  dimma: { osa: 1, nimi: "Dimma", vari: "#07A99D" },
  grofi: { osa: 2, nimi: "Grofi", vari: "#F84800" },
  "ai-softarobotit": { osa: 3, nimi: "AI Softarobotit", vari: "#8DB80F" },
  bistek: { osa: 4, nimi: "Bistek", vari: "#2563EB" },
};

function lahtotaso(osa: number | null): number[] {
  const t = [...LAHTOTASO];
  if (osa !== null) t[osa] = Math.min(...LAHTOTASO) - 0.06;
  return t;
}

function pullonkaulaOf(kap: number[]): number {
  let i = 0;
  kap.forEach((k, j) => {
    if (k < kap[i]) i = j;
  });
  return i;
}

export default function Pullonkaula({ yhtio }: { yhtio?: string }) {
  const oma = yhtio ? YHTIOT[yhtio] ?? null : null;
  const alku = lahtotaso(oma ? oma.osa : null);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const kapRef = useRef<number[]>(alku);
  const nakyvaRef = useRef<number[]>([...alku]); // animoitu aukko
  const [kap, setKap] = useState<number[]>([...alku]);
  const omaRef = useRef(oma);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const gateRects = useRef<{ x: number; y: number; w: number; h: number }[]>([]);

  const pk = pullonkaulaOf(kap);
  const valmis = kap.every((k) => k >= 0.95);

  const korjaa = useCallback((i: number) => {
    const uusi = [...kapRef.current];
    uusi[i] = Math.min(1, Math.max(uusi[i] + 0.4, 0.95));
    kapRef.current = uusi;
    setKap(uusi);
  }, []);

  const alusta = useCallback(() => {
    const t = lahtotaso(omaRef.current ? omaRef.current.osa : null);
    kapRef.current = t;
    setKap([...t]);
  }, []);

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    const cv = canvas.current;
    const el = wrap.current;
    if (!cv || !el) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduce = vahentaaLiiketta();

    let w = 0;
    let h = 0;
    let pysty = false;
    let hiukkaset: Hiukkanen[] = [];
    let seuraava = Array(OSAT.length).fill(0) as number[];
    let spawnAt = 0;
    let t = 0;
    let raf = 0;
    let last = performance.now();
    let nakyvissa = true;

    const koko = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(280, Math.floor(r.width));
      pysty = w < 640;
      h = pysty ? 560 : 270;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Virtauksen akseli: vaakasuunnassa vasemmalta oikealle, kapealla näytöllä ylhäältä alas.
    const pituus = () => (pysty ? h - 40 : w - 40);
    const leveys = () => (pysty ? 120 : 120);
    const portti = (i: number) => (pituus() * (i + 1)) / (OSAT.length + 1);
    const piste = (s: number, y: number): [number, number] =>
      pysty ? [w * 0.62 + y, 20 + s] : [20 + s, 110 + y];

    const askel = (dt: number) => {
      t += dt;
      const kapNyt = kapRef.current;
      const L = pituus();
      // Uusi hiukkanen lähteestä, jos alku ei ole tukossa.
      if (t >= spawnAt) {
        const vika = hiukkaset[hiukkaset.length - 1];
        if (!vika || vika.s > VALI * 1.5) {
          hiukkaset.push({ s: 0, y: (Math.random() - 0.5) * 34, v: NOPEUS * (0.85 + Math.random() * 0.3) });
        }
        spawnAt = t + 1 / LAHDE;
      }
      // Liikutetaan edestä taaksepäin, jotta jono muodostuu oikein.
      for (let k = 0; k < hiukkaset.length; k++) {
        const p = hiukkaset[k];
        const edella = k > 0 ? hiukkaset[k - 1] : null;
        let uusi = p.s + p.v * dt;
        if (edella && uusi > edella.s - VALI) uusi = Math.max(p.s, edella.s - VALI);
        for (let i = 0; i < OSAT.length; i++) {
          const g = portti(i);
          if (p.s < g && uusi >= g) {
            if (t >= seuraava[i]) {
              seuraava[i] = t + 1 / (LAHDE * 1.02 * kapNyt[i]);
            } else {
              uusi = Math.min(uusi, g - 0.01);
            }
          }
        }
        p.s = uusi;
        // Aukon kohdalla hiukkaset puristuvat keskelle.
        const lim = 6 + 26 * minAukko(p.s);
        p.y += ((Math.max(-lim, Math.min(lim, p.y)) - p.y) * Math.min(1, dt * 8));
      }
      hiukkaset = hiukkaset.filter((p) => p.s < L);
    };

    const minAukko = (s: number) => {
      for (let i = 0; i < OSAT.length; i++) {
        if (Math.abs(s - portti(i)) < 14) return nakyvaRef.current[i];
      }
      return 1;
    };

    const piirra = () => {
      ctx.clearRect(0, 0, w, h);
      const kapNyt = kapRef.current;
      const nak = nakyvaRef.current;
      for (let i = 0; i < nak.length; i++) nak[i] += (kapNyt[i] - nak[i]) * 0.12;
      const pkNyt = pullonkaulaOf(kapNyt);
      const kaikki = kapNyt.every((k) => k >= 0.95);
      const L = pituus();
      const B = leveys() / 2;

      // Kanava
      ctx.strokeStyle = HIUS;
      ctx.lineWidth = 1;
      const [a1x, a1y] = piste(0, -B);
      const [a2x, a2y] = piste(L, -B);
      const [b1x, b1y] = piste(0, B);
      const [b2x, b2y] = piste(L, B);
      ctx.beginPath();
      ctx.moveTo(a1x, a1y);
      ctx.lineTo(a2x, a2y);
      ctx.moveTo(b1x, b1y);
      ctx.lineTo(b2x, b2y);
      ctx.stroke();

      // Portit (osat)
      const rects: { x: number; y: number; w: number; h: number }[] = [];
      for (let i = 0; i < OSAT.length; i++) {
        const g = portti(i);
        const auki = 8 + (B - 8) * nak[i];
        const onPk = !kaikki && i === pkNyt;
        const hov = hoverRef.current === i;
        const omaOsa = omaRef.current && omaRef.current.osa === i ? omaRef.current : null;
        ctx.fillStyle = omaOsa ? omaOsa.vari : onPk ? HEHKU : hov ? HARMAA : HIILI;
        const paksu = 10;
        const [p1x, p1y] = piste(g - paksu / 2, -B);
        const [p2x, p2y] = piste(g + paksu / 2, -auki);
        const [q1x, q1y] = piste(g - paksu / 2, auki);
        const [q2x, q2y] = piste(g + paksu / 2, B);
        rectBetween(ctx, p1x, p1y, p2x, p2y);
        rectBetween(ctx, q1x, q1y, q2x, q2y);
        const [cx, cy] = piste(g, 0);
        rects.push(pysty ? { x: cx - B - 10, y: cy - 24, w: 2 * B + 20 + w, h: 48 } : { x: cx - 28, y: cy - B - 10, w: 56, h: 2 * B + 120 });

        // Nimet
        const korostus = onPk || !!omaOsa;
        ctx.fillStyle = korostus ? HIILI : HARMAA;
        ctx.font = `${korostus ? 600 : 500} 13px "IBM Plex Sans", system-ui, sans-serif`;
        const mono = `500 11px "IBM Plex Mono", ui-monospace, monospace`;
        if (pysty) {
          const tagit: [string, string][] = [];
          if (omaOsa) tagit.push([omaOsa.nimi.toUpperCase(), HARMAA]);
          if (onPk) tagit.push(["PULLONKAULA", "#8A5A00"]);
          const x = cx - B - 14;
          let y = cy - tagit.length * 8;
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillText(OSAT[i].lyhyt, x, y);
          ctx.font = mono;
          for (const [teksti, vari] of tagit) {
            y += 16;
            ctx.fillStyle = vari;
            ctx.fillText(teksti, x, y);
          }
        } else {
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const yLoppu = wrapText(ctx, OSAT[i].lyhyt, cx, cy + B + 14, Math.min(110, (L / (OSAT.length + 1)) - 8), 16);
          if (omaOsa) {
            ctx.font = mono;
            ctx.fillStyle = HARMAA;
            wrapText(ctx, omaOsa.nimi.toUpperCase(), cx, yLoppu + 18, Math.min(120, (L / (OSAT.length + 1)) - 4), 14);
          }
          if (onPk) {
            ctx.font = mono;
            ctx.fillStyle = "#8A5A00";
            ctx.fillText("PULLONKAULA", cx, cy - B - 26);
          }
        }
      }
      gateRects.current = rects;

      // Hiukkaset
      ctx.fillStyle = HIILI;
      for (const p of hiukkaset) {
        const [x, y] = piste(p.s, p.y);
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (nakyvissa) {
        askel(dt);
        piirra();
      }
      raf = requestAnimationFrame(loop);
    };

    koko();
    if (reduce) {
      // Ilman animaatiota: simuloidaan tilanne valmiiksi ja piirretään pysäytyskuva.
      const staattinen = () => {
        hiukkaset = [];
        seuraava = Array(OSAT.length).fill(0);
        t = 0;
        spawnAt = 0;
        for (let i = 0; i < 1200; i++) askel(1 / 60);
        nakyvaRef.current = [...kapRef.current];
        piirra();
      };
      staattinen();
      const id = window.setInterval(staattinen, 400);
      const ro = new ResizeObserver(() => { koko(); staattinen(); });
      ro.observe(el);
      return () => { window.clearInterval(id); ro.disconnect(); };
    }
    // Esilämmitys, jotta jono näkyy heti.
    for (let i = 0; i < 600; i++) askel(1 / 60);
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => { koko(); hiukkaset = []; for (let i = 0; i < 600; i++) askel(1 / 60); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { nakyvissa = e.isIntersecting; });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const osuma = (e: React.MouseEvent<HTMLCanvasElement>): number | null => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const i = gateRects.current.findIndex((g) => x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h);
    return i >= 0 ? i : null;
  };

  return (
    <div className="el-pk" ref={wrap}>
      <canvas
        ref={canvas}
        aria-hidden="true"
        style={{ cursor: hover !== null ? "pointer" : "default", display: "block" }}
        onMouseMove={(e) => setHover(osuma(e))}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          const i = osuma(e);
          if (i !== null) korjaa(i);
        }}
      />
      <div className="el-pk-ohj" aria-live="polite">
        {valmis ? (
          <p><strong>Kaikki osat on korjattu.</strong> Virta kulkee tasaisesti koko koneiston läpi.</p>
        ) : (
          <p>
            Pullonkaula nyt: <strong>{OSAT[pk].lyhyt}</strong>. Napsauta osaa korjataksesi sen ja katso, mihin jono siirtyy.
          </p>
        )}
        <div className="el-pk-napit">
          {!valmis ? (
            <button type="button" className="button" onClick={() => korjaa(pk)}>Korjaa pullonkaula</button>
          ) : null}
          <button type="button" className="button secondary" onClick={alusta}>Aloita alusta</button>
        </div>
      </div>
    </div>
  );
}

function rectBetween(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number): number {
  const sanat = text.split(" ");
  let rivi = "";
  let yy = y;
  for (const s of sanat) {
    const koe = rivi ? `${rivi} ${s}` : s;
    if (ctx.measureText(koe).width > max && rivi) {
      ctx.fillText(rivi, x, yy);
      rivi = s;
      yy += lh;
    } else rivi = koe;
  }
  if (rivi) ctx.fillText(rivi, x, yy);
  return yy;
}
