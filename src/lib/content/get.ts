import "server-only";
import { db } from "@/lib/db";
import { contentDefaults, type Content, type ContentKey } from "./defaults";
import { conform } from "./shape";
import { formatDeadline, isPpdbOpen } from "@/lib/ppdb/deadline";

/** Konten publik: isi DB digabung dengan defaults. Kalau DB belum siap, pakai defaults saja. */
export async function getContent<K extends ContentKey>(key: K): Promise<Content<K>> {
  try {
    const row = await db.siteContent.findUnique({ where: { key } });
    return conform(row?.data, contentDefaults[key]);
  } catch (e) {
    console.error(`[content] gagal membaca "${key}", memakai default`, e);
    return contentDefaults[key];
  }
}

/**
 * Status pendaftaran + jumlah pendaftar untuk bar kuota.
 * isOpen = dibuka admin DAN belum lewat batas waktu (tutup otomatis); deadline = teks batas, mis. "3 Januari 2027".
 */
export async function getPpdbStatus() {
  try {
    const [info, registered] = await Promise.all([
      db.ppdbInfo.findUnique({ where: { id: 1 }, select: { isOpen: true, closesAt: true, closesAtTime: true } }),
      db.registration.count(),
    ]);
    const isOpen = isPpdbOpen(info);
    const deadline = isOpen && info?.closesAt ? formatDeadline(info.closesAt, info.closesAtTime) : "";
    return { isOpen, deadline, registered };
  } catch (e) {
    console.error("[content] gagal membaca status PPDB", e);
    return { isOpen: false, deadline: "", registered: 0 };
  }
}

/** Kepala sekolah = guru yang ditandai di Pengaturan → Guru & Staf (menu ⋮ → Jadikan Kepala Sekolah). */
export async function getKepalaSekolah() {
  const guru = await getContent("guru");
  return guru.daftar.find((g) => g.kepalaSekolah) ?? null;
}
