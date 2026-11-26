// Kasvukoneiston kuusi osaa (sama järjestys ja nimet kuin etusivulla ja Kasvukoneisto-sivulla).
export const OSAT = [
  { lyhyt: "Johtaminen", osa: "Ohjausjärjestelmä" },
  { lyhyt: "Myynti ja markkinointi", osa: "Moottori" },
  { lyhyt: "Talous ja rahoitus", osa: "Polttoaine" },
  { lyhyt: "Automaatio ja tekoäly", osa: "Vaihteisto" },
  { lyhyt: "Ohjelmistot", osa: "Teknologia" },
  { lyhyt: "Avainhenkilöt", osa: "Ihmiset" },
];

// Havainnollistuksen lähtötaso osittain (suhteellinen, ei mittaustulos eikä näytetä lukuna).
export const LAHTOTASO = [0.72, 0.5, 0.62, 0.34, 0.8, 0.56];

export function vahentaaLiiketta(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
