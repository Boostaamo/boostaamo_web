"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Form, { type FormKind } from "@/components/Form";

export type FormSlot = { id: string; kind: FormKind; arg?: string };

// Sisältö renderöidään HTML:nä, ja lomakkeet liitetään sen paikkamerkkeihin Reactin portaaleilla.
export default function FormPortals({ slots, source }: { slots: FormSlot[]; source: string }) {
  const [targets, setTargets] = useState<Record<string, Element>>({});

  useEffect(() => {
    const found: Record<string, Element> = {};
    for (const s of slots) {
      const el = document.getElementById(s.id);
      if (el) found[s.id] = el;
    }
    setTargets(found);
  }, [slots]);

  return (
    <>
      {slots.map((s) =>
        targets[s.id] ? createPortal(<Form kind={s.kind} arg={s.arg} source={source} />, targets[s.id], s.id) : null,
      )}
    </>
  );
}
