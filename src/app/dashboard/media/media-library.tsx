"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import { deleteMedia, type MediaItem } from "@/lib/admin/content-actions";
import { MediaGrid, UploadModal, useUploader } from "./media-picker";

const fmt = (b: number) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [q, setQ] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [dialog, confirm] = useConfirm();
  const { busy, err, upload, editor } = useUploader((done) => {
    toast.success(`${done.length} gambar berhasil diunggah.`);
    router.refresh();
  });

  const shown = items.filter((m) => m.filename.toLowerCase().includes(q.toLowerCase()));

  async function remove(m: MediaItem) {
    const ok = await confirm({
      title: "Hapus gambar ini?",
      message: "Kalau gambar ini masih dipakai di website atau berita, tempatnya akan kosong.",
      confirmText: "Ya, hapus",
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      toast.result(await deleteMedia(m.id));
      setSel(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {dialog}
      {editor}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onFiles={(files) => {
            setShowUpload(false);
            upload(files);
          }}
        />
      )}

      {/* Toolbar: cari (kiri, panjang) · unggah (kanan) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama file…"
            aria-label="Cari gambar"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-sm shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => setShowUpload(true)}
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
        >
          {busy ? "Mengunggah…" : "⬆ Unggah Gambar"}
        </button>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {q && <p className="text-xs text-slate-500">{shown.length} gambar cocok dengan “{q}”</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <MediaGrid items={shown} onPick={setSel} selected={sel?.url} />
        </div>
        <aside className="h-fit rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-6">
          {sel ? (
            <div className="space-y-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sel.url} alt={sel.filename} className="max-h-72 w-full rounded-lg bg-slate-100 object-contain" />
              <p className="font-semibold break-all text-slate-800">{sel.filename}</p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Diunggah oleh</dt>
                  <dd className="truncate text-right font-medium text-slate-700" title={sel.uploadedBy}>{sel.uploadedBy || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Tanggal</dt>
                  <dd className="text-right text-slate-700">{new Date(sel.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Ukuran</dt>
                  <dd className="text-right text-slate-700">{fmt(sel.size)}</dd>
                </div>
              </dl>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50"
                  onClick={() => {
                    navigator.clipboard?.writeText(location.origin + sel.url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? "✓ Tersalin" : "Salin Link"}
                </button>
                <button type="button" disabled={pending} onClick={() => remove(sel)} className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Klik gambar untuk melihat detail.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
