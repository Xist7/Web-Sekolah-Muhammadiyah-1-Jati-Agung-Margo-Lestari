import { Fragment, type ReactNode } from "react";

/** "Tim Peneliti ITERA: Lensa Herbal!" → "tim-peneliti-itera-lensa-herbal" */
export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

export const formatTanggal = (d: Date | string | null | undefined, withTime = false) =>
  d
    ? new Date(d).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(withTime && { hour: "2-digit", minute: "2-digit" }),
        timeZone: "Asia/Jakarta",
      })
    : "";

export const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Teks polos untuk ringkasan (hapus sintaks format). */
export const plainText = (s: string) =>
  s.replace(/!\[[^\]]*]\([^)]*\)/g, "").replace(/\[([^\]]+)]\([^)]*\)/g, "$1").replace(/[*#>_-]+/g, "").replace(/\s+/g, " ").trim();

const safeUrl = (u: string) => (/^(https?:\/\/|\/)/i.test(u) ? u : "#");

/** Format sebaris: **tebal**, *miring*, [teks](link). React meng-escape teks otomatis (aman dari XSS). */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) out.push(<strong key={k}>{m[1]}</strong>);
    else if (m[2]) out.push(<em key={k}>{m[2]}</em>);
    else out.push(<a key={k} href={safeUrl(m[4])} target={m[4].startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">{m[3]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Render isi berita. Format (dipakai tombol toolbar editor):
 *   paragraf dipisah baris kosong · ## Subjudul · ### Sub-subjudul · > kutipan
 *   - poin · 1. poin bernomor · ![keterangan](url-gambar) · **tebal** · *miring* · [teks](link)
 */
export function renderContent(src: string): ReactNode[] {
  const blocks = src.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  return blocks.flatMap((raw, bi) => {
    const b = raw.trim();
    if (!b) return [];
    const k = `b${bi}`;
    const img = b.match(/^!\[([^\]]*)]\(([^)\s]+)\)$/);
    if (img)
      return (
        <figure key={k}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={safeUrl(img[2])} alt={img[1]} loading="lazy" />
          {img[1] && <figcaption>{img[1]}</figcaption>}
        </figure>
      );
    // Subjudul hanya baris pertama; baris setelahnya (tanpa baris kosong) jadi blok biasa
    const heading = b.match(/^(#{2,3}) (.*)(?:\n([\s\S]*))?$/);
    if (heading) {
      const h = heading[1].length === 2 ? <h2 key={k}>{inline(heading[2], k)}</h2> : <h3 key={k}>{inline(heading[2], k)}</h3>;
      const rest = heading[3]?.trim();
      return rest ? [h, <Fragment key={`${k}r`}>{renderContent(rest)}</Fragment>] : [h];
    }
    const lines = b.split("\n");
    if (lines.every((l) => /^[-*] /.test(l))) return <ul key={k}>{lines.map((l, i) => <li key={i}>{inline(l.slice(2), `${k}${i}`)}</li>)}</ul>;
    if (lines.every((l) => /^\d+[.)] /.test(l))) return <ol key={k}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\d+[.)] /, ""), `${k}${i}`)}</li>)}</ol>;
    if (lines.every((l) => l.startsWith(">"))) return <blockquote key={k}>{inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), k)}</blockquote>;
    return <p key={k}>{lines.flatMap((l, i) => (i ? [<br key={`br${i}`} />, ...inline(l, `${k}${i}`)] : inline(l, `${k}${i}`)))}</p>;
  });
}
