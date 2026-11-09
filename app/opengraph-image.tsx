import { ImageResponse } from "next/og";

export const alt = "Boostaamo – yritysten kasvuyhteisö";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0C0C0D", color: "#EDE9E9", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96, position: "relative" }}>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 8 }}>BOOSTAAMO</div>
        <div style={{ fontSize: 40, marginTop: 24 }}>Yritysten kasvuyhteisö</div>
        <div style={{ position: "absolute", left: 96, right: 96, bottom: 72, height: 16, borderRadius: 8, background: "#FFB000" }} />
      </div>
    ),
    size,
  );
}
