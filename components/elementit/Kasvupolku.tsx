"use client";

import { useEffect, useRef, useState } from "react";
import { vahentaaLiiketta } from "@/components/elementit/osat";

// Ehdotus B: Kasvupolku. Nouseva käyrä piirtyy, kun osio tulee näkyviin, ja hehkuva piste
// kulkee sitä pitkin. Vaiheet ovat sivuston palvelupolun vaiheet. Akseleilla ei ole lukuja.

const VAIHEET = [
  { t: 0.08, nimi: "Kasvukoneiston katsastus", ala: "Missä kasvu jarruttaa" },
  { t: 0.38, nimi: "Syväkatsastus", ala: "Yksi osa tarkemmin" },
  { t: 0.66, nimi: "Kasvun Tiekartta", ala: "Mitä tehdään ja missä järjestyksessä" },
  { t: 0.94, nimi: "Growth Board", ala: "Kasvua johdetaan jatkuvasti" },
];

const POLKU = "M 40 330 C 180 330, 220 300, 300 270 S 420 230, 480 205 S 600 150, 660 130 S 820 60, 960 40";

export default function Kasvupolku() {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGGElement>(null);
  const [pisteet, setPisteet] = useState<{ x: number; y: number }[]>([]);
  const [alku, setAlku] = useState(false);
  const [len, setLen] = useState(2000);

  useEffect(() => {
    const p = path.current;
    if (!p) return;
    const L = p.getTotalLength();
    setLen(L);
    setPisteet(VAIHEET.map((v) => {
      const pt = p.getPointAtLength(L * v.t);
      return { x: pt.x, y: pt.y };
    }));
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (vahentaaLiiketta()) {
      setAlku(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setAlku(true);
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Piste kulkee käyrää pitkin silmukassa piirron jälkeen.
  useEffect(() => {
    if (!alku || vahentaaLiiketta()) return;
    const p = path.current;
    const d = dot.current;
    if (!p || !d) return;
    const L = p.getTotalLength();
    let raf = 0;
    const t0 = performance.now() + 2400;
    const loop = (now: number) => {
      const t = Math.max(0, now - t0) / 6000;
      const u = t % 1;
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const pt = p.getPointAtLength(L * e);
      d.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      d.style.opacity = now < t0 ? "0" : String(Math.min(1, Math.sin(Math.PI * u) * 3));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [alku]);

  return (
    <div className={`el-polku${alku ? " on" : ""}`} ref={root}>
      <svg viewBox="0 0 1000 380" role="img" aria-label="Kasvupolku: Kasvukoneiston katsastus, syväkatsastus, Kasvun Tiekartta ja Growth Board">
        <defs>
          <linearGradient id="polku-ala" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFB000" stopOpacity=".22" />
            <stop offset="1" stopColor="#FFB000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[90, 170, 250, 330].map((y) => (
          <line key={y} x1="40" x2="960" y1={y} y2={y} stroke="#EFEBEB" strokeWidth="1" />
        ))}
        <path d={`${POLKU} L 960 330 L 40 330 Z`} fill="url(#polku-ala)" className="el-polku-ala" />
        <path
          ref={path}
          d={POLKU}
          fill="none"
          stroke="#0C0C0D"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ strokeDasharray: len, strokeDashoffset: alku ? 0 : len }}
          className="el-polku-viiva"
        />
        {pisteet.map((pt, i) => (
          <g key={i} className="el-polku-vaihe" style={{ transitionDelay: `${0.5 + i * 0.5}s` }} transform={`translate(${pt.x} ${pt.y})`}>
            <circle r="9" fill="#fff" stroke="#0C0C0D" strokeWidth="2.5" />
            <circle r="3.5" fill="#0C0C0D" />
          </g>
        ))}
        <g ref={dot} style={{ opacity: 0 }}>
          <circle r="16" fill="#FFB000" opacity=".28" />
          <circle r="7" fill="#FFB000" />
        </g>
      </svg>
      <ol className="el-polku-lista">
        {VAIHEET.map((v, i) => (
          <li key={v.nimi} style={{ transitionDelay: `${0.5 + i * 0.5}s` }}>
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            <strong>{v.nimi}</strong>
            <span>{v.ala}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
