"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const RATIOS: { key: string; label: string; value: number | null }[] = [
  { key: "asli", label: "Asli", value: null },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "3:4", label: "3:4 (pas foto)", value: 3 / 4 },
];

const MAX_SIDE = 1920; // sisi terpanjang hasil
const QUALITY = 0.7; // kompresi JPEG 70%
const fmt = (b: number) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

/**
 * Editor gambar sebelum diunggah: pratinjau, crop (pilih rasio), zoom, geser, putar.
 * Tanpa library — pakai <canvas>. Hasil: JPEG 70%, maks. 1920 px.
 */
export function ImageEditor({
  file,
  onDone,
  onCancel,
  index,
  total,
}: {
  file: File;
  onDone: (f: File) => void;
  onCancel: () => void;
  index?: number;
  total?: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [ratioKey, setRatioKey] = useState("asli");
  const [rot, setRot] = useState(0); // 0 / 90 / 180 / 270
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [frameW, setFrameW] = useState(560);
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  // Lebar bingkai mengikuti layar (HP/tablet/desktop)
  useLayoutEffect(() => {
    const el = frameRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setFrameW(Math.min(el.clientWidth, 640)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nw = img?.naturalWidth ?? 1;
  const nh = img?.naturalHeight ?? 1;
  const rotated = rot % 180 !== 0;
  const rw = rotated ? nh : nw; // ukuran setelah diputar
  const rh = rotated ? nw : nh;
  const ratio = RATIOS.find((r) => r.key === ratioKey)?.value ?? rw / rh;
  // Bingkai tidak terlalu tinggi di layar pendek
  const maxH = typeof window === "undefined" ? 420 : Math.min(460, window.innerHeight * 0.5);
  const W = Math.min(frameW, maxH * ratio);
  const H = W / ratio;
  const cover = Math.max(W / rw, H / rh);
  const scale = cover * zoom;

  // Jaga gambar selalu menutupi bingkai
  const clamp = (o: { x: number; y: number }, s = scale) => {
    const mx = Math.max(0, (rw * s - W) / 2);
    const my = Math.max(0, (rh * s - H) / 2);
    return { x: Math.min(mx, Math.max(-mx, o.x)), y: Math.min(my, Math.max(-my, o.y)) };
  };
  const o = clamp(off);

  const reset = () => {
    setZoom(1);
    setOff({ x: 0, y: 0 });
  };

  async function apply() {
    if (!img) return;
    setSaving(true);
    try {
      // Resolusi asli area yang dipilih, dibatasi 1920 px
      const k = Math.min(1 / scale, MAX_SIDE / Math.max(W, H));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(W * k));
      canvas.height = Math.max(1, Math.round(H * k));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.fillStyle = "#fff"; // latar putih untuk PNG transparan
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";
      ctx.scale(k, k);
      ctx.translate(W / 2 + o.x, H / 2 + o.y);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -nw / 2, -nh / 2);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
      if (!blob) throw new Error("blob");
      onDone(new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
    } catch {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-label="Edit gambar sebelum diunggah"
      className="m-auto w-[calc(100%-24px)] max-w-2xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
        <h2 className="mr-auto font-bold text-slate-800">
          ✂️ Edit Gambar {total && total > 1 ? <span className="text-sm font-normal text-slate-400">({(index ?? 0) + 1} dari {total})</span> : null}
        </h2>
        <span className="hidden max-w-[40%] truncate text-xs text-slate-400 sm:inline" title={file.name}>{file.name} · {fmt(file.size)}</span>
        <button type="button" onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Batal">✕</button>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        {/* Area pratinjau & crop */}
        <div className="flex justify-center rounded-xl bg-slate-900/90 p-3">
          <div
            ref={frameRef}
            className="relative cursor-grab touch-none overflow-hidden rounded-md bg-slate-800 select-none active:cursor-grabbing"
            style={{ width: W, height: H }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, ox: o.x, oy: o.y };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (d) setOff(clamp({ x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y }));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onWheel={(e) => setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.0015)))}
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt="Pratinjau"
                draggable={false}
                className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
                style={{ width: nw, height: nh, transform: `translate(-50%, -50%) translate(${o.x}px, ${o.y}px) rotate(${rot}deg) scale(${scale})` }}
              />
            ) : (
              <p className="grid h-full place-items-center text-sm text-slate-400">Memuat gambar…</p>
            )}
            {/* Garis bantu sepertiga */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }, (_, i) => <span key={i} className="border border-white/15" />)}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">Geser gambar untuk mengatur posisi · scroll / slider untuk zoom</p>

        {/* Kontrol */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Potong:</span>
          {RATIOS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setRatioKey(r.key);
                reset();
              }}
              aria-pressed={ratioKey === r.key}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${ratioKey === r.key ? "bg-emerald-700 text-white ring-emerald-700" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="img-zoom" className="text-xs font-semibold text-slate-600">Zoom</label>
          <input id="img-zoom" type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="min-w-32 flex-1 accent-emerald-700" />
          <button
            type="button"
            onClick={() => {
              setRot((r) => (r + 90) % 360);
              reset();
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            ⟳ Putar
          </button>
          <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-[11px] text-slate-400 sm:mr-auto">Hasil otomatis dikompres (JPEG 70%, maks. 1920 px)</p>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100">Batal</button>
        <button type="button" onClick={apply} disabled={!img || saving} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {saving ? "Memproses…" : total && total > 1 && (index ?? 0) + 1 < total ? "Unggah & Lanjut →" : "⬆ Unggah"}
        </button>
      </div>
    </dialog>
  );
}
