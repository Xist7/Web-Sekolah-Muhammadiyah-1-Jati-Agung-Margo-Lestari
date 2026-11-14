"use client";

import { useRef } from "react";

type Guru = { nama: string; mapel: string; foto: string };
type Props = { eyebrow: string; judul: string; subjudul: string; daftar: Guru[] };

export function GuruCarousel({ eyebrow, judul, subjudul, daftar }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const geser = (arah: 1 | -1) =>
    track.current?.scrollBy({ left: arah * 300, behavior: "smooth" });

  return (
    <section className="guru" aria-labelledby="h-guru">
      <div className="container">
        <div className="section-head center">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title" id="h-guru">{judul}</h2>
        {subjudul && <p className="guru-sub">{subjudul}</p>}
        </div>
        <div className="guru-wrap">
          <button type="button" className="guru-nav" onClick={() => geser(-1)} aria-label="Geser ke kiri">‹</button>
          <div className="guru-track" ref={track}>
            {daftar.map((g, i) => (
              <article className="guru-card" key={i}>
                {g.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.foto} alt={`Foto ${g.nama}`} loading="lazy" />
                ) : (
                  <div className="guru-ph" role="img" aria-label={`Foto ${g.nama}`}>👤</div>
                )}
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