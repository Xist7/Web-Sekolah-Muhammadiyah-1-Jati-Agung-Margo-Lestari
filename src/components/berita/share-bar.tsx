"use client";

import { useState } from "react";

// Tombol bagikan di samping artikel (vertikal di desktop, horizontal di HP)
export function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window === "undefined" ? "" : window.location.href);
  const open = (make: (u: string, t: string) => string) => () =>
    window.open(make(encodeURIComponent(url()), encodeURIComponent(title)), "_blank", "noopener,noreferrer");

  const items = [
    { label: "WhatsApp", icon: "🟢", go: open((u, t) => `https://wa.me/?text=${t}%20${u}`) },
    { label: "Facebook", icon: "f", go: open((u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`) },
    { label: "X", icon: "𝕏", go: open((u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`) },
    { label: "Telegram", icon: "✈", go: open((u, t) => `https://t.me/share/url?url=${u}&text=${t}`) },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <aside className="share-bar" aria-label="Bagikan berita">
      <span className="share-label">Bagikan</span>
      {items.map((s) => (
        <button key={s.label} type="button" onClick={s.go} title={`Bagikan ke ${s.label}`} aria-label={`Bagikan ke ${s.label}`}>
          {s.icon}
        </button>
      ))}
      <button type="button" onClick={copy} title="Salin link" aria-label="Salin link">
        {copied ? "✓" : "🔗"}
      </button>
    </aside>
  );
}
