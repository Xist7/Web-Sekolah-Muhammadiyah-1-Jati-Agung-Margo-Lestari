"use client";

import { useEffect, useRef, useState } from "react";
import { listMedia, uploadImage, type MediaItem } from "@/lib/admin/content-actions";
import { compressImage } from "@/lib/image";

const fmt = (b: number) => (b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`);

/** Unggah satu/lebih gambar ke pustaka media (dikompres dulu). */
export function useUploader(onDone: (items: { url: string }[]) => void) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  async function upload(files: FileList | File[]) {
    setBusy(true);
    setErr(undefined);
    const done: { url: string }[] = [];
    for (const f of Array.from(files)) {
      try {
        const small = await compressImage(f, { quality: 0.7, maxSide: 1920 });
        const fd = new FormData();
        fd.set("file", small);
        const r = await uploadImage(fd);
        if (r.ok) done.push({ url: r.url });
        else setErr(`${f.name}: ${r.message}`);
      } catch {
        setErr(`${f.name}: gagal diunggah.`);
      }
    }
    setBusy(false);
    if (done.length) onDone(done);
  }
  return { busy, err, upload };
}

export function MediaGrid({ items, onPick, selected }: { items: MediaItem[]; onPick?: (m: MediaItem) => void; selected?: string }) {
  if (items.length === 0) return <p className="py-10 text-center text-sm text-slate-400">Belum ada gambar. Unggah gambar pertama.</p>;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            onClick={() => onPick?.(m)}
            className={`group block w-full overflow-hidden rounded-lg bg-white text-left ring-1 transition hover:ring-2 hover:ring-emerald-500 ${selected === m.url ? "ring-2 ring-emerald-600" : "ring-slate-200"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.filename} loading="lazy" className="aspect-video w-full bg-slate-100 object-cover" />
            <span className="block truncate px-2 pt-1.5 text-[11px] text-slate-600">{m.filename}</span>
            <span className="block px-2 pb-1.5 text-[10px] text-slate-400">{fmt(m.size)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Modal pilih gambar dari pustaka media (atau unggah baru langsung dari sini). */
export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const { busy, err, upload } = useUploader((done) => onPick(done[0].url));

  useEffect(() => {
    ref.current?.showModal();
    listMedia().then(setItems).catch(() => setItems([]));
  }, []);

  const shown = items?.filter((m) => m.filename.toLowerCase().includes(q.toLowerCase())) ?? [];

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%-32px)] max-w-4xl rounded-2xl bg-slate-50 p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      aria-label="Pilih gambar dari media"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
        <h2 className="mr-auto text-lg font-bold text-slate-800">🖼️ Pustaka Media</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama file…" aria-label="Cari gambar" className="w-48 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => e.target.files && upload(e.target.files)} />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Mengunggah…" : "⬆ Unggah Baru"}
        </button>
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" aria-label="Tutup">✕</button>
      </div>
      {err && <p className="bg-red-50 px-5 py-2 text-sm text-red-600">{err}</p>}
      <div className="max-h-[65vh] overflow-y-auto p-5">
        {items === null ? <p className="py-10 text-center text-sm text-slate-400">Memuat media…</p> : <MediaGrid items={shown} onPick={(m) => onPick(m.url)} />}
      </div>
    </dialog>
  );
}
