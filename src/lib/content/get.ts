import "server-only";
import { db } from "@/lib/db";
import { contentDefaults, type Content, type ContentKey } from "./defaults";
import { conform } from "./shape";

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

/** Status pendaftaran (buka/tutup) + jumlah pendaftar untuk bar kuota. */
export async function getPpdbStatus() {
  try {
    const [info, registered] = await Promise.all([
      db.ppdbInfo.findUnique({ where: { id: 1 }, select: { isOpen: true } }),
      db.registration.count(),
    ]);
    return { isOpen: info?.isOpen ?? false, registered };
  } catch (e) {
    console.error("[content] gagal membaca status PPDB", e);
    return { isOpen: false, registered: 0 };
  }
}
