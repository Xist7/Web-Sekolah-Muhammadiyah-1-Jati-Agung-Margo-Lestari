"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Media } from "@/lib/content/defaults";

/** Satu ekskul dari panel admin (Pengaturan → Ekstrakurikuler). */
export type Ekskul = { nama: string; keterangan: string; deskripsi: string; media: Media; video: string };

type Tampilan =
  | { kind: "youtube"; id: string }
  | { kind: "video"; src: string }
  | { kind: "image"; src: string }
  | { kind: "emoji"; emoji: string };

const YOUTUBE = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/;
const FILE_VIDEO = /\.(mp4|webm|mov)(\?.*)?$/i;

/** Urutan prioritas: video → gambar → emoji. Link video yang tidak bisa diputar diabaikan. */
function tampilan(e: Ekskul): Tampilan {
  const video = e.video.trim();
  const yt = video.match(YOUTUBE)?.[1];
  if (yt) return { kind: "youtube", id: yt };
  if (FILE_VIDEO.test(video)) return { kind: "video", src: video };
  if (e.media.jenis === "gambar" && e.media.gambar) return { kind: "image", src: e.media.gambar };
  return { kind: "emoji", emoji: e.media.emoji };
}

function MediaView({ media, nama, active }: { media: Exclude<Tampilan, { kind: "emoji" }>; nama: string; active: boolean }) {
  if (media.kind === "image") {
    return (
      <div
        className="ek-img"
        role="img"
        aria-label={`Kegiatan ${nama} SMP Muhammadiyah 1 Jati Agung`}
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
      title={`Video ${nama}`}
      allow="accelerometer; encrypted-media; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  ) : null;
}

export function EkskulSlider({ items }: { items: Ekskul[] }) {
  const total = items.length;
  const [index, setIndex] = useState(0);
  const i = Math.max(0, Math.min(index, total - 1)); // tetap aman bila jumlah ekskul berkurang
  const root = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  // Hentikan video yang sedang diputar saat pindah slide
  useEffect(() => {
    root.current?.querySelectorAll("video").forEach((v) => v.pause());
  }, [i]);

  const prev = () => setIndex(Math.max(0, i - 1));
  const next = () => setIndex(Math.min(total - 1, i + 1));

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

  if (total === 0) return <p style={{ color: "var(--muted-2)" }}>Belum ada ekstrakurikuler.</p>;

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
          {items.map((e, idx) => {
            const media = tampilan(e);
            return (
              <div className={`ek-slide${i === idx ? " is-active" : ""}`} key={idx}>
                <div className="ek-feature">
                  {media.kind !== "emoji" && (
                    <div className="ek-media">
                      <MediaView media={media} nama={e.nama} active={i === idx} />
                    </div>
                  )}
                  <div className="ek-text">
                    {media.kind === "emoji" && media.emoji && <span className="ek-emoji" aria-hidden="true">{media.emoji}</span>}
                    {e.keterangan && <p className="eyebrow">{e.keterangan}</p>}
                    <h3>{e.nama}</h3>
                    {e.deskripsi && <p>{e.deskripsi}</p>}
                  </div>
                </div>
              </div>
            );
          })}
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

      {total > 1 && (
        <div className="ek-dots">
          {items.map((e, n) => (
            <button
              type="button"
              key={n}
              className={`ek-dot${n === i ? " is-active" : ""}`}
              onClick={() => setIndex(n)}
              aria-label={`Ke slide ${n + 1}: ${e.nama}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
