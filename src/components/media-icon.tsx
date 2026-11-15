import type { Media } from "@/lib/content/defaults";

/** Ikon dari panel admin: emoji, atau gambar yang diunggah. */
export function MediaIcon({ m, alt = "" }: { m: Media; alt?: string }) {
  if (m.jenis === "gambar" && m.gambar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.gambar} alt={alt} loading="lazy" style={{ width: "1.4em", height: "1.4em", objectFit: "contain", verticalAlign: "middle" }} />;
  }
  return <>{m.emoji}</>;
}
