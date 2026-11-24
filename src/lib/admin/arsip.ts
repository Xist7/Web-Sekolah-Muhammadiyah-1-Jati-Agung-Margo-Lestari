import "server-only";
import { db } from "@/lib/db";
import { nomorPrefix, tahunDariNomor, urutDariNomor } from "@/lib/ppdb/nomor";
import { requireAdmin } from "./guard";

/** Awalan kolom target di audit log untuk unduhan arsip satu tahun. Dipakai mengecek apakah arsip sudah diunduh. */
export const arsipTarget = (tahun: string) => `Arsip PPDB ${tahun} · `;

export type ArsipTahun = {
  tahun: string;
  ids: string[];
  fileIds: string[];
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  /** nomor urut terbesar di tahun ini */
  lastUrut: number;
  dari: Date;
  sampai: Date;
  fileBytes: number;
  /** unduhan CSV terakhir (siapa & kapan), null = belum pernah */
  unduhan: { at: Date; oleh: string } | null;
  /** CSV sudah diunduh dan tidak ada pendaftar/status yang berubah sesudahnya */
  arsipSah: boolean;
};

/** Data pendaftar per tahun pendaftaran (dari nomor PPDB-<tahun>-…), terlama dulu. */
export async function getArsip(): Promise<ArsipTahun[]> {
  await requireAdmin();
  const [regs, files] = await Promise.all([
    db.registration.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, regNumber: true, status: true, createdAt: true, photoId: true, sklId: true },
    }),
    db.upload.findMany({ where: { isPublic: false }, select: { id: true, size: true } }),
  ]);
  const sizeOf = new Map(files.map((f) => [f.id, f.size]));

  const groups = new Map<string, typeof regs>();
  for (const r of regs) {
    const tahun = tahunDariNomor(r.regNumber);
    if (!tahun) continue;
    const g = groups.get(tahun);
    if (g) g.push(r);
    else groups.set(tahun, [r]);
  }

  return Promise.all(
    [...groups].sort(([a], [b]) => a.localeCompare(b)).map(async ([tahun, rows]) => {
      const [unduhan, perubahan] = await Promise.all([
        db.auditLog.findFirst({
          where: { action: "DOWNLOAD", target: { startsWith: arsipTarget(tahun) } },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, actorName: true, actorEmail: true },
        }),
        // Status / catatan pendaftar diubah setelah arsip diunduh → arsipnya sudah usang
        db.auditLog.findFirst({
          where: { action: "UPDATE", target: { startsWith: nomorPrefix(tahun) } },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);
      const sampai = rows[rows.length - 1].createdAt;
      const fileIds = rows.flatMap((r) => [r.photoId, r.sklId]).filter((x): x is string => !!x);
      const count = (s: string) => rows.filter((r) => r.status === s).length;
      return {
        tahun,
        ids: rows.map((r) => r.id),
        fileIds,
        total: rows.length,
        pending: count("PENDING"),
        accepted: count("ACCEPTED"),
        rejected: count("REJECTED"),
        lastUrut: Math.max(...rows.map((r) => urutDariNomor(r.regNumber))),
        dari: rows[0].createdAt,
        sampai,
        fileBytes: fileIds.reduce((n, id) => n + (sizeOf.get(id) ?? 0), 0),
        unduhan: unduhan ? { at: unduhan.createdAt, oleh: unduhan.actorName || unduhan.actorEmail } : null,
        arsipSah: !!unduhan && unduhan.createdAt > sampai && (!perubahan || unduhan.createdAt > perubahan.createdAt),
      };
    }),
  );
}
