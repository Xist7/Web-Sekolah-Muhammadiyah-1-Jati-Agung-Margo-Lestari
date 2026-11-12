import "server-only";
import { db } from "@/lib/db";

/** Batas penyimpanan audit log (lihat juga halaman /dashboard/audit-log). */
export const AUDIT_MAX_ROWS = 5_000; // ±2–3 MB
export const AUDIT_EMERGENCY_ROWS = 1_000; // dipakai saat database hampir penuh
export const DB_LIMIT_BYTES = 512 * 1024 * 1024; // kuota Neon Free (0,5 GB)
const DB_EMERGENCY_RATIO = 0.8;
const PRUNE_EVERY = 25; // cek pemangkasan kira-kira tiap 25 log baru (supaya ringan)

export type AuditAction = "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "UPLOAD" | "PUBLISH" | "OPEN" | "CLOSE";
type Actor = { email: string; name?: string | null };

/**
 * Catat aktivitas admin. Tidak pernah melempar error: kegagalan audit log
 * tidak boleh membatalkan aksi utama (mis. simpan berita).
 */
export async function logAudit(actor: Actor, action: AuditAction, summary: string, target = "") {
  try {
    await db.auditLog.create({
      data: {
        actorEmail: actor.email,
        actorName: (actor.name ?? "").slice(0, 120),
        action,
        summary: summary.slice(0, 300),
        target: target.slice(0, 300),
      },
    });
    if (Math.random() < 1 / PRUNE_EVERY) await pruneAuditLog();
  } catch (e) {
    console.error("[audit] gagal mencatat", e);
  }
}

/** Ukuran database saat ini (byte). */
export async function getDbSize(): Promise<number> {
  const [row] = await db.$queryRaw<{ size: bigint }[]>`SELECT pg_database_size(current_database()) AS size`;
  return Number(row.size);
}

/**
 * Hapus audit log terlama:
 *  - normal  : sisakan 5.000 terbaru
 *  - darurat : bila database > 80% kuota, sisakan 1.000 terbaru
 */
export async function pruneAuditLog() {
  const size = await getDbSize();
  const keep = size > DB_LIMIT_BYTES * DB_EMERGENCY_RATIO ? AUDIT_EMERGENCY_ROWS : AUDIT_MAX_ROWS;
  const deleted = await db.$executeRaw`
    DELETE FROM "AuditLog"
    WHERE "createdAt" < (SELECT "createdAt" FROM "AuditLog" ORDER BY "createdAt" DESC OFFSET ${keep - 1} LIMIT 1)`;
  if (deleted > 0) console.info(`[audit] ${deleted} log lama dihapus otomatis (sisa ${keep})`);
  return deleted;
}
