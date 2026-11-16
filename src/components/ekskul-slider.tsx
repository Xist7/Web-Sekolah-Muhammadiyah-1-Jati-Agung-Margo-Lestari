"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string }
  | { kind: "youtube"; id: string; title: string };

type Unggulan = { title: string; desc: string; media?: Media };

const unggulan: Unggulan[] = [
  {
    title: "Pramuka",
    desc: "Membentuk karakter disiplin, mandiri, dan peduli lingkungan melalui kegiatan kepanduan yang menyenangkan.",
    media: { kind: "image", src: "/ekskul/pramuka.jpeg", alt: "Kegiatan Pramuka SMP Muhammadiyah 1 Jati Agung" },
  },
  {
    title: "Tapak Suci",
    desc: "Melatih kebugaran, disiplin, dan kepercayaan diri siswa melalui seni bela diri.",
    media: { kind: "video", src: "/ekskul/silat.mp4" },
  },
  {
    title: "Sepak Bola",
    desc: "Membangun kekompakan tim, sportivitas, dan kebugaran jasmani siswa.",
  },
  {
    title: "Hizbul Wathan",
    desc: "Membentuk karakter mandiri, disiplin, dan cinta tanah air melalui kepanduan.",
  },
  {
    title: "Hadroh",
    desc: "Mengembangkan bakat seni musik islami dan kecintaan pada shalawat.",
  },
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
  const total = unggulan.length; // + slide "Ekskul Lainnya"
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
                {e.media && (
                <div className="ek-media">
                  <MediaView media={e.media} active={i === idx} />
                </div>
                )}
                <div className="ek-text">
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                </div>
              </div>
            </div>
          ))}
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