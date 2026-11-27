"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import { hapusArsip } from "@/lib/admin/arsip-actions";

export type ArsipView = {
  tahun: string;
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  periode: string;
  ukuran: string;
  unduhan: string; // "" = belum pernah diunduh
  arsipSah: boolean;
  terlama: boolean;
};

export function ArsipCard({ a, ppdbOpen, tahunTerlama }: { a: ArsipView; ppdbOpen: boolean; tahunTerlama: string }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [pending, start] = useTransition();
  const [dialog, confirm] = useConfirm();
  const busy = downloading || pending;

  // Alasan tombol hapus terkunci (server mengecek ulang syarat yang sama)
  const locked = ppdbOpen
    ? "Tutup pendaftaran dulu."
    : !a.terlama
      ? `Hapus dari yang terlama dulu (PPDB ${tahunTerlama}).`
      : !a.arsipSah
        ? a.unduhan ? "Ada perubahan data setelah arsip terakhir. Unduh CSV lagi." : "Unduh arsip CSV dulu."
        : "";

  async function download() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pendaftar-csv?tahun=${a.tahun}`);
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? `arsip-ppdb-${a.tahun}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.success(`Arsip PPDB ${a.tahun} diunduh (${a.total} pendaftar).`);
      router.refresh();
    } catch {
      toast.error("Arsip gagal diunduh. Muat ulang halaman lalu coba lagi.");
    } finally {
      setDownloading(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `Hapus semua data PPDB ${a.tahun}?`,
      message: (
        <>
          <b>{a.total} pendaftar</b> beserta <b>pas foto & SKL</b> ({a.ukuran}) dihapus permanen dan tidak bisa dikembalikan.
          <span className="mt-2 block">CSV hanya berisi biodata — foto & SKL <b>tidak ikut</b> tersimpan di arsip. Pastikan file CSV-nya sudah bisa dibuka.</span>
          {a.pending > 0 && <span className="mt-2 block font-semibold text-red-600">Masih ada {a.pending} pendaftar berstatus Menunggu.</span>}
        </>
      ),
      confirmText: "Ya, hapus permanen",
      danger: true,
      delay: 5,
    });
    if (!ok) return;
    start(async () => {
      const r = await hapusArsip(a.tahun);
      toast.result(r);
      router.refresh();
    });
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {dialog}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-800">
            PPDB {a.tahun}
            {a.terlama && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">Terlama</span>}
          </h3>
          <p className="text-sm text-slate-500">{a.periode}</p>
          <p className="mt-2 text-sm text-slate-600">
            <b className="text-slate-800">{a.total}</b> pendaftar · {a.accepted} diterima · {a.rejected} ditolak · {a.pending} menunggu
          </p>
          <p className="text-sm text-slate-600">Pas foto & SKL: <b className="text-slate-800">{a.ukuran}</b></p>
          <p className={`mt-2 text-xs font-medium ${a.arsipSah ? "text-emerald-700" : "text-amber-700"}`}>
            {a.arsipSah ? `✅ Arsip sudah diunduh ${a.unduhan}` : a.unduhan ? `⚠ Arsip usang — terakhir diunduh ${a.unduhan}, setelah itu datanya berubah` : "⚠ Arsip belum diunduh"}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-56">
          <button type="button" onClick={download} disabled={busy} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
            {downloading ? "Menyiapkan…" : "⬇ Unduh Arsip CSV"}
          </button>
          <button type="button" onClick={remove} disabled={busy || !!locked} className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
            {pending ? "Menghapus…" : "🗑 Hapus Data"}
          </button>
          {locked && <p className="text-center text-xs text-slate-500">🔒 {locked}</p>}
        </div>
      </div>
    </article>
  );
}
