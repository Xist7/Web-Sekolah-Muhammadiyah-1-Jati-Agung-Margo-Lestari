"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { guru } from "@/data/guru";

// "Siti Wardani" -> "SW", "RAHMAT, S.Pd" -> "R" (gelar setelah koma diabaikan)
function inisial(nama: string) {
  const kata = nama.split(",")[0].trim().split(/\s+/).filter(Boolean);
  return kata
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase())
    .join("");
}

function FotoGuru({ nama, foto }: { nama: string; foto?: string }) {
  const [gagal, setGagal] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // Gambar yang gagal sebelum React siap tidak memicu onError, jadi cek sekali setelah mount
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setGagal(true);
  }, []);

  if (!foto || gagal) {
    return (
      <div className="tp-foto tp-foto-inisial" role="img" aria-label={`Foto ${nama} belum tersedia`}>
        {inisial(nama)}
      </div>
    );
  }

  return (
    <div className="tp-foto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={foto} alt={`Foto ${nama}`} onError={() => setGagal(true)} />
    </div>
  );
}

export function GuruCarousel() {
  return (
    <section className="guru" aria-labelledby="h-guru">
      <div className="container">
        <Reveal>
          <div className="tp-layout">
            <div className="tp-head">
              <p className="eyebrow">Guru &amp; Staf</p>
              <h2 className="section-title" id="h-guru">Tenaga Pendidik</h2>
              <p className="tp-sub">Dibimbing oleh guru-guru profesional yang ahli di bidangnya.</p>
            </div>
            <div className="tp-grid">
              {guru.map((g) => (
                <article className="tp-card" key={g.nama}>
                  <FotoGuru nama={g.nama} foto={g.foto} />
                  <h3>{g.nama}</h3>
                  <p>{g.mapel}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}