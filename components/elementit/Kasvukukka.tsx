"use client";

import { useEffect, useRef, useState } from "react";
import { OSAT, LAHTOTASO, vahentaaLiiketta } from "@/components/elementit/osat";

// Ehdotus C: Kasvukukka. Kuusi osaa terälehtinä keskipisteen ympärillä. Keskellä oleva
// kasvun ympyrä on yhtä suuri kuin heikoin osa: se kasvaa vain, kun heikoin osa vahvistuu.

const CX = 210;
const CY = 210;
const RMIN = 54;
const RMAX = 190;

function sektori(i: number, r: number, n: number): string {
  const vali = 0.05;
  const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + vali;
  const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - vali;
  const r0 = RMIN - 6;
  const p = (a: number, rr: number) => `${(CX + Math.cos(a) * rr).toFixed(1)} ${(CY + Math.sin(a) * rr).toFixed(1)}`;
  return `M ${p(a0, r0)} L ${p(a0, r)} A ${r} ${r} 0 0 1 ${p(a1, r)} L ${p(a1, r0)} A ${r0} ${r0} 0 0 0 ${p(a0, r0)} Z`;
}

export default function Kasvukukka() {
  const [taso, setTaso] = useState<number[]>([...LAHTOTASO]);
  const [nak, setNak] = useState<number[]>(() => LAHTOTASO.map(() => 0.15));
  const [valittu, setValittu] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const kaynnissa = useRef(false);

  // Kasvu alkaa, kun elementti tulee näkyviin; arvot liukuvat tavoitteeseen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (vahentaaLiiketta()) {
      kaynnissa.current = true;
      setNak([...LAHTOTASO]);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) kaynnissa.current = true;
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (vahentaaLiiketta()) {
      setNak([...taso]);
      return;
    }
    let raf = 0;
    const loop = () => {
      if (kaynnissa.current) {
        setNak((n) => {
          const uusi = n.map((v, i) => v + (taso[i] - v) * 0.06);
          return uusi.every((v, i) => Math.abs(v - taso[i]) < 0.002) ? [...taso] : uusi;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [taso]);

  const heikoin = taso.indexOf(Math.min(...taso));
  const minNak = Math.min(...nak);
  const rKasvu = RMIN * 0.25 + (RMIN - 10 - RMIN * 0.25) * minNak;
  const valmis = taso.every((v) => v >= 0.99);

  const vahvista = (i: number) => {
    setTaso((t) => t.map((v, j) => (j === i ? Math.min(1, v + 0.2) : v)));
    setValittu(i);
  };

  return (
    <div className="el-kukka" ref={root}>
      <svg viewBox="0 0 420 420" role="img" aria-label="Kasvukoneiston kuusi osaa. Keskellä oleva kasvu on yhtä suuri kuin heikoin osa.">
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <circle key={k} cx={CX} cy={CY} r={RMIN + (RMAX - RMIN) * k} fill="none" stroke="#EFEBEB" />
        ))}
        {OSAT.map((o, i) => {
          const r = RMIN + (RMAX - RMIN) * nak[i];
          const onHeikoin = !valmis && i === heikoin;
          return (
            <path
              key={o.lyhyt}
              d={sektori(i, r, OSAT.length)}
              className={`el-kukka-osa${onHeikoin ? " heikoin" : ""}${valittu === i ? " valittu" : ""}`}
              onClick={() => vahvista(i)}
            />
          );
        })}
        <circle cx={CX} cy={CY} r={RMIN - 8} fill="#fff" />
        <circle cx={CX} cy={CY} r={rKasvu} className={`el-kukka-kasvu${valmis ? " valmis" : ""}`} />
        <text x={CX} y={CY + 4} textAnchor="middle" className="el-kukka-teksti">KASVU</text>
      </svg>
      <div className="el-kukka-osat">
        {OSAT.map((o, i) => (
          <button
            type="button"
            key={o.lyhyt}
            className={`el-kukka-nappi${!valmis && i === heikoin ? " heikoin" : ""}`}
            onClick={() => vahvista(i)}
            aria-label={`Vahvista osa ${o.lyhyt}`}
          >
            <span className="mono">{o.osa}</span>
            <span>{o.lyhyt}</span>
            <span className="el-kukka-palkki"><span style={{ width: `${Math.round(nak[i] * 100)}%` }} /></span>
          </button>
        ))}
        <p className="el-kukka-ohje" aria-live="polite">
          {valmis
            ? "Kaikki osat ovat vahvoja, ja kasvu täyttää keskustan."
            : `Kasvu on yhtä suuri kuin heikoin osa, nyt ${OSAT[heikoin].lyhyt.toLowerCase()}. Vahvista osia ja katso, milloin kasvu liikahtaa.`}
        </p>
        <button type="button" className="button secondary" onClick={() => { setTaso([...LAHTOTASO]); setValittu(null); }}>Aloita alusta</button>
      </div>
    </div>
  );
}
