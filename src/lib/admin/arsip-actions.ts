"use server";

import { revalidatePath } from "next/cache";
import { getDbSize, logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { isPpdbOpen } from "@/lib/ppdb/deadline";
import { getNomorTerpakai, NOMOR_KEY } from "@/lib/ppdb/nomor";
import type { ActionResult } from "./actions";
import { getArsip } from "./arsip";
import { requireAdmin, UnauthorizedError } from "./guard";

const mb = (b: number) => `${(b / 1048576).toFixed(1)} MB`;

/**
 * DELETE di Postgres tidak langsung mengecilkan ukuran tabel; VACUUM FULL yang mengembalikan ruangnya ke kuota Neon.
 * Gagal pun tidak apa-apa: data tetap terhapus dan ruangnya dipakai ulang oleh pendaftar berikutnya.
 */
async function kembalikanRuang() {
  try {
    await db.$executeRawUnsafe('VACUUM FULL "Upload"');
    await db.$executeRawUnsafe('VACUUM FULL "Registration"');
  } catch (e) {
    console.warn("[arsip] VACUUM FULL gagal (data tetap terhapus)", e);
  }
}

/**
 * Hapus permanen semua pendaftar satu tahun beserta pas foto & SKL-nya. Syarat (dicek di server):
 *  1. pendaftaran PPDB sedang ditutup
 *  2. tahun itu adalah yang TERLAMA
 *  3. CSV arsipnya sudah diunduh dan masih sesuai data terakhir
 */
export async function hapusArsip(tahun: string): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    const [info, arsip] = await Promise.all([
      db.ppdbInfo.findUnique({ where: { id: 1 }, select: { isOpen: true, closesAt: true, closesAtTime: true } }),
      getArsip(),
    ]);
    if (isPpdbOpen(info)) return { ok: false, message: "Pendaftaran masih dibuka. Tutup pendaftaran dulu sebelum menghapus data." };
    const target = arsip.find((a) => a.tahun === tahun);
    if (!target) return { ok: false, message: "Data tahun ini tidak ditemukan (mungkin sudah dihapus)." };
    if (target !== arsip[0]) return { ok: false, message: `Hapus dari yang terlama dulu: PPDB ${arsip[0].tahun}.` };
    if (!target.arsipSah) return { ok: false, message: `Unduh arsip CSV PPDB ${tahun} terbaru dulu sebelum menghapus.` };

    const before = await getDbSize();
    const nomor = await getNomorTerpakai();
    const data = { ...nomor, [tahun]: Math.max(nomor[tahun] ?? 0, target.lastUrut) };
    await db.$transaction([
      // Ingat nomor terakhir, supaya nomor di arsip tidak dipakai ulang kalau pendaftaran dibuka lagi di tahun yang sama
      db.siteContent.upsert({ where: { key: NOMOR_KEY }, create: { key: NOMOR_KEY, data }, update: { data } }),
      db.upload.deleteMany({ where: { id: { in: target.fileIds }, isPublic: false } }),
      db.registration.deleteMany({ where: { id: { in: target.ids } } }),
    ]);
    await logAudit(me, "DELETE", `menghapus data pendaftar PPDB ${tahun} (sudah diarsipkan)`, `${target.total} pendaftar · ${target.fileIds.length} berkas`);
    await kembalikanRuang();
    const after = await getDbSize();
    revalidatePath("/dashboard", "layout");
    revalidatePath("/ppdb");
    return { ok: true, message: `${target.total} pendaftar PPDB ${tahun} dihapus. Database: ${mb(before)} → ${mb(after)}.` };
  } catch (e) {
    if (e instanceof UnauthorizedError) return { ok: false, message: e.message };
    console.error("[arsip]", e);
    return { ok: false, message: "Terjadi kesalahan server. Coba lagi." };
  }
}
