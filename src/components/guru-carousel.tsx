"use client";

import { useRef } from "react";
import { guru } from "@/data/guru";

export function GuruCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const geser = (arah: 1 | -1) =>
    track.current?.scrollBy({ left: arah * 300, behavior: "smooth" });

  return (
    <section className="guru" aria-labelledby="h-guru">
      <div className="container">
        <div className="section-head center">
        <p className="eyebrow">Guru &amp; Staf</p>
        <h2 className="section-title" id="h-guru">Tenaga Pendidik</h2>
        <p className="guru-sub">Dibimbing oleh guru-guru profesional yang ahli di bidangnya.</p>
        </div>
        <div className="guru-wrap">
          <button type="button" className="guru-nav" onClick={() => geser(-1)} aria-label="Geser ke kiri">‹</button>
          <div className="guru-track" ref={track}>
            {guru.map((g) => (
              <article className="guru-card" key={g.nama}>
                <img src={g.foto} alt={`Foto ${g.nama}`} loading="lazy" />
                <h3>{g.nama}</h3>
                <p>{g.mapel}</p>
              </article>
            ))}
          </div>
          <button type="button" className="guru-nav" onClick={() => geser(1)} aria-label="Geser ke kanan">›</button>
        </div>
      </div>
    </section>
  );
}