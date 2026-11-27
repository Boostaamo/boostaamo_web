"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Sisällön elementti, jolla on data-asti="VVVV-KK-PP", piilotetaan päivän jälkeen
 *  (esim. pidetty webinaari). Elementti data-kun-tyhja näytetään, kun kaikki sen ryhmän
 *  (data-ryhma) elementit ovat vanhentuneet. */
export default function Vanhentuvat() {
  const path = usePathname();
  useEffect(() => {
    const t = new Date();
    const tanaan = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    const ryhmat = new Map<string, number>();
    document.querySelectorAll<HTMLElement>("[data-asti]").forEach((el) => {
      const vanha = (el.dataset.asti ?? "") < tanaan;
      el.hidden = vanha;
      const r = el.dataset.ryhma;
      if (r && !vanha) ryhmat.set(r, (ryhmat.get(r) ?? 0) + 1);
    });
    document.querySelectorAll<HTMLElement>("[data-kun-tyhja]").forEach((el) => {
      el.hidden = (ryhmat.get(el.dataset.kunTyhja ?? "") ?? 0) > 0;
    });
  }, [path]);
  return null;
}
