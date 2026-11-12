"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { deleteMedia, type MediaItem } from "@/lib/admin/content-actions";
import { MediaGrid, useUploader } from "./media-picker";

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [dialog, confirm] = useConfirm();
  const { busy, err, upload } = useUploader(() => router.refresh());

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
      await deleteMedia(m.id);
      setSel(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {dialog}
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
      >
        <p className="mr-auto text-sm text-slate-500">Tarik & letakkan gambar ke sini, atau</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(e) => e.target.files && upload(e.target.files)} />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Mengunggah…" : "⬆ Unggah Gambar"}
        </button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama file…" aria-label="Cari gambar" className="w-52 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <MediaGrid items={shown} onPick={setSel} selected={sel?.url} />
        </div>
        <aside className="h-fit rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-20">
          {sel ? (
            <div className="space-y-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sel.url} alt={sel.filename} className="w-full rounded-lg bg-slate-100 object-contain" />
              <p className="font-medium break-all text-slate-700">{sel.filename}</p>
              <p className="text-xs text-slate-400">Diunggah {new Date(sel.createdAt).toLocaleString("id-ID")}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  onClick={() => { navigator.clipboard?.writeText(location.origin + sel.url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                >
                  {copied ? "✓ Tersalin" : "Salin Link"}
                </button>
                <button type="button" disabled={pending} onClick={() => remove(sel)} className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
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
