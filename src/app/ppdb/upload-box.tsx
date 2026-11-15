"use client";

import { compressImage } from "@/lib/image";
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";

const fmt = (b: number) => (b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB");

type Props = {
  title: string;
  hint: ReactNode;
  icon: string;
  dropText: string;
  pickText: string;
  accept: string[];
  maxMb: number;
  formatsLabel: string;
  formatError: string;
  file?: File;
  error?: string;
  onFile: (f: File) => void;
  onError: (msg: string) => void;
  children?: ReactNode;
};

export function UploadBox(p: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const preview = useMemo(
    () => (p.file?.type.startsWith("image/") ? URL.createObjectURL(p.file) : undefined),
    [p.file],
  );
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function handle(raw?: File) {
    if (!raw) return;
    if (!p.accept.includes(raw.type)) return p.onError(p.formatError);
    // Gambar dikompres dulu (JPEG 60%, maks. 1600 px) supaya hemat ruang database & cepat diunggah
    const f = await compressImage(raw, { quality: 0.8, maxSide: 1600 });
    const max = p.maxMb * 1048576;
    if (f.size > max) return p.onError(`Ukuran ${fmt(f.size)} melebihi batas ${fmt(max)}.`);
    p.onError("");
    p.onFile(f);
  }

  const dragOn = (e: DragEvent) => { e.preventDefault(); setOver(true); };
  const dragOff = (e: DragEvent) => { e.preventDefault(); setOver(false); };
  const pick = () => { if (inputRef.current) { inputRef.current.value = ""; inputRef.current.click(); } };

  return (
    <div className={`upload${p.error ? " invalid" : ""}`}>
      <div className="upload-head"><h3>{p.title}</h3><span className="chip chip-sand">Wajib diisi</span></div>
      <p className="hint" style={{ marginBottom: 10 }}>{p.hint}</p>
      <div
        className={`drop${over ? " over" : ""}`}
        style={p.file ? { display: "none" } : undefined}
        onDragEnter={dragOn}
        onDragOver={dragOn}
        onDragLeave={dragOff}
        onDrop={(e) => { dragOff(e); handle(e.dataTransfer.files[0]); }}
      >
        <div className="ic" aria-hidden="true"> {p.icon}</div>
        <strong>{p.dropText}</strong>
        <span className="sub">atau pilih file dari komputer / ponsel Anda</span>
        <button type="button" className="btn btn-soft btn-sm pick" onClick={pick}>{p.pickText}</button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={p.accept.join(",")}
          tabIndex={-1}
          onChange={(e) => handle(e.target.files?.[0])}
        />
        <small>{p.formatsLabel}</small>
      </div>
      <div className={`file-row${p.file ? " show" : ""}`}>
        <div className="thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt={`Pratinjau ${p.file?.name}`} /> : p.icon}
        </div>
        <div className="file-info">
          <b>{p.file?.name}</b>
          <small>{p.file && `${fmt(p.file.size)} • ${(p.file.type.split("/")[1] || "").toUpperCase()}`}</small>
          <br />
          <span className="ok-badge">Terunggah &amp; siap diverifikasi</span>
        </div>
        <button type="button" className="btn btn-ghost btn-sm replace" onClick={pick}>Ganti</button>
      </div>
      <span className="err">{p.error}</span>
      {p.children}
    </div>
  );
}
