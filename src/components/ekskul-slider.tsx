"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Bot, ChevronLeft, ChevronRight, Mic, Music, Sprout } from "lucide-react";

type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string }
  | { kind: "youtube"; id: string; title: string };

type Unggulan = { title: string; desc: string; media: Media };

const unggulan: Unggulan[] = [
  {
    title: "Pramuka",
    desc: "Membentuk karakter disiplin, mandiri, dan peduli lingkungan melalui kegiatan kepanduan yang menyenangkan.",
    media: { kind: "image", src: "/ekskul/pramuka.jpeg", alt: "Kegiatan Pramuka SMP Muhammadiyah 1 Jati Agung" },
  },
  {
    title: "Taekwondo/Silat",
    desc: "Melatih kebugaran, disiplin, dan kepercayaan diri siswa melalui seni bela diri.",
    media: { kind: "video", src: "/ekskul/silat.mp4" },
  },
];

const lainnya = [
  { Icon: Bot, name: "Robotik & AI", desc: "Mengembangkan kemampuan STEM melalui proyek robotika dan IoT yang terstruktur." },
  { Icon: Activity, name: "Basket & Futsal", desc: "Melatih kebugaran, kerja sama tim, dan sportivitas lewat olahraga bola." },
  { Icon: Sprout, name: "Eco Hidroponik", desc: "Praktik hidroponik dan konservasi tanaman untuk memupuk rasa hormat pada alam." },
  { Icon: Mic, name: "English Debate", desc: "Melatih keberanian berbicara dan berpikir kritis dalam bahasa Inggris." },
  { Icon: Music, name: "Seni & Musik", desc: "Wadah menyalurkan kreativitas lewat musik dan seni." },
];

function MediaView({ media, active }: { media: Media; active: boolean }) {
  if (media.kind === "image") {
    return (
      <div
        className="ek-img"
        role="img"
        aria-label={media.alt}
        style={{ backgroundImage: `url('${media.src}')` }}
      />
    );
  }
  if (media.kind === "video") {
    return <video controls preload="metadata" playsInline src={media.src} />;
  }
  // YouTube dipasang hanya saat slide aktif, supaya berhenti diputar ketika slide digeser
  return active ? (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${media.id}`}
      title={media.title}
      allow="accelerometer; encrypted-media; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  ) : null;
}

export function EkskulSlider() {
  const total = unggulan.length + 1; // + slide "Ekskul Lainnya"
  const [i, setI] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  // Hentikan video yang sedang diputar saat pindah slide
  useEffect(() => {
    root.current?.querySelectorAll("video").forEach((v) => v.pause());
  }, [i]);

  const prev = () => setI((n) => Math.max(0, n - 1));
  const next = () => setI((n) => Math.min(total - 1, n + 1));

  const onTouchStart = (e: React.TouchEvent) => {
    // jangan anggap geser di kontrol video sebagai geser slide
    touchX.current = (e.target as HTMLElement).closest("video") ? null : e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (dx < -50) next();
    else if (dx > 50) prev();
  };

  return (
    <div
      className="ek"
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Ekstrakurikuler"
    >
      <div className="ek-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="ek-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {unggulan.map((e, idx) => (
            <div className={`ek-slide${i === idx ? " is-active" : ""}`} key={e.title}>
              <div className="ek-feature">
                <div className="ek-media">
                  <MediaView media={e.media} active={i === idx} />
                </div>
                <div className="ek-text">
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                </div>
              </div>
            </div>
          ))}

          <div className={`ek-slide${i === total - 1 ? " is-active" : ""}`}>
            <div className="ek-others">
              {lainnya.map((l) => (
                <article className="ek-card" key={l.name}>
                  <div className="ek-card-ic"><l.Icon size={22} strokeWidth={2} /></div>
                  <h4>{l.name}</h4>
                  <p>{l.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {i > 0 && (
        <button type="button" className="ek-nav ek-prev" onClick={prev} aria-label="Slide sebelumnya">
          <ChevronLeft size={22} />
        </button>
      )}
      {i < total - 1 && (
        <button type="button" className="ek-nav ek-next" onClick={next} aria-label="Slide berikutnya">
          <ChevronRight size={22} />
        </button>
      )}

      <div className="ek-dots">
        {Array.from({ length: total }).map((_, n) => (
          <button
            type="button"
            key={n}
            className={`ek-dot${n === i ? " is-active" : ""}`}
            onClick={() => setI(n)}
            aria-label={`Ke slide ${n + 1}`}
          />
        ))}
      </div>
    </div>
  );
}