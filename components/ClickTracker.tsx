"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Lähettää tapahtumat linkeistä, joilla on data-track. track() ei tee mitään ilman suostumusta.
export default function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a[data-track]") as HTMLElement | null;
      if (!el) return;
      const event = el.dataset.track;
      if (!event) return;
      const params: Record<string, string> = { link_url: el.getAttribute("href") ?? "" };
      if (el.dataset.yhtio) params.yhtio = el.dataset.yhtio;
      track(event, params);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
