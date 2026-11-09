"use client";

export default function ConsentReopen() {
  return (
    <button
      type="button"
      className="link-button"
      onClick={() => window.dispatchEvent(new Event("consent:open"))}
    >
      Evästeasetukset
    </button>
  );
}
