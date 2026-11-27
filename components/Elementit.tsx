"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Pullonkaula from "@/components/elementit/Pullonkaula";

export type ElementtiSlot = { id: string; nimi: string; arg?: string };

const ELEMENTIT: Partial<Record<string, (arg?: string) => React.ReactElement>> = {
  pullonkaula: (arg) => <Pullonkaula yhtio={arg} />,
};

// Sisällön paikkamerkki <!--elementti:nimi--> tai <!--elementti:nimi|arvo--> korvataan elävällä elementillä (kuten lomakkeet).
export default function Elementit({ slots }: { slots: ElementtiSlot[] }) {
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
      {slots.map((s) => {
        const tee = ELEMENTIT[s.nimi];
        return tee && targets[s.id] ? createPortal(tee(s.arg), targets[s.id], s.id) : null;
      })}
    </>
  );
}
