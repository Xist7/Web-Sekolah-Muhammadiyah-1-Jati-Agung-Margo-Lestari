import "server-only";
import { db } from "@/lib/db";

/** Nomor pendaftaran: PPDB-<tahun>-<urut 4 digit>, mis. PPDB-2026-0001. */
export const nomorPrefix = (tahun: string | number) => `PPDB-${tahun}-`;
export const tahunDariNomor = (regNumber: string) => regNumber.match(/^PPDB-(\d{4})-/)?.[1] ?? null;
export const urutDariNomor = (regNumber: string) => Number(regNumber.match(/^PPDB-\d{4}-(\d+)$/)?.[1] ?? 0);

/**
 * Nomor urut terakhir dari tahun yang datanya sudah dihapus (lihat lib/admin/arsip-actions).
 * Disimpan di tabel SiteContent: { "2026": 120 }. Supaya nomor di arsip tidak dipakai lagi oleh pendaftar baru.
 */
export const NOMOR_KEY = "ppdb-nomor";

export async function getNomorTerpakai(): Promise<Record<string, number>> {
  const row = await db.siteContent.findUnique({ where: { key: NOMOR_KEY } });
  const data = row?.data;
  if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
  return Object.fromEntries(Object.entries(data).filter((e): e is [string, number] => typeof e[1] === "number"));
}

/** Nomor urut berikutnya untuk tahun tersebut: lanjut dari nomor TERBESAR, bukan dari jumlah baris (baris bisa dihapus). */
export async function nomorBerikutnya(tahun: number): Promise<string> {
  const prefix = nomorPrefix(tahun);
  const [last, terpakai] = await Promise.all([
    db.registration.findFirst({ where: { regNumber: { startsWith: prefix } }, orderBy: { regNumber: "desc" }, select: { regNumber: true } }),
    getNomorTerpakai(),
  ]);
  const n = Math.max(last ? urutDariNomor(last.regNumber) : 0, terpakai[tahun] ?? 0) + 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}
