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

/** Ukuran tiap tabel (data + indeks + TOAST), terbesar dulu. */
export async function getTableSizes(): Promise<{ name: string; rows: number; bytes: number }[]> {
  const rows = await db.$queryRaw<{ name: string; rows: bigint; bytes: bigint }[]>`
    SELECT relname AS name, n_live_tup AS rows, pg_total_relation_size(relid) AS bytes
    FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC`;
  return rows.map((r) => ({ name: r.name, rows: Number(r.rows), bytes: Number(r.bytes) }));
}

export type UsagePart = { key: string; label: string; hint: string; bytes: number; count?: number; color: string };

/**
 * Pemakaian database dikelompokkan per KEGUNAAN (bukan nama tabel), supaya mudah dipahami admin.
 * Tabel Upload dipecah jadi berkas pendaftar (privat) vs gambar website/berita (publik).
 */
export async function getDbBreakdown(): Promise<{ total: number; parts: UsagePart[] }> {
  const [total, tables, uploads] = await Promise.all([
    getDbSize(),
    db.$queryRaw<{ schema: string; name: string; bytes: bigint }[]>`
      SELECT n.nspname AS schema, c.relname AS name, pg_total_relation_size(c.oid) AS bytes
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind IN ('r', 'm') AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')`,
    db.$queryRaw<{ isPublic: boolean; n: bigint; bytes: bigint }[]>`
      SELECT "isPublic", count(*) AS n, COALESCE(sum(octet_length(data)), 0) AS bytes FROM "Upload" GROUP BY "isPublic"`,
  ]);
  const size = (name: string) => Number(tables.find((t) => t.schema === "public" && t.name === name)?.bytes ?? 0);
  const [regCount, postCount, logCount] = await Promise.all([db.registration.count(), db.post.count(), db.auditLog.count()]);

  // Ukuran tabel Upload (data + indeks) dibagi sesuai porsi isi file publik/privat
  const uploadTotal = size("Upload");
  const pub = uploads.find((u) => u.isPublic);
  const priv = uploads.find((u) => !u.isPublic);
  const pubData = Number(pub?.bytes ?? 0);
  const privData = Number(priv?.bytes ?? 0);
  const dataSum = pubData + privData;
  const privBytes = dataSum ? Math.round(uploadTotal * (privData / dataSum)) : 0;
  const pubBytes = uploadTotal - privBytes;

  const known = new Set(["Upload", "Registration", "Post", "SiteContent", "AuditLog"]);
  const adminTables = tables.filter((t) => t.schema === "public" && !known.has(t.name)).reduce((n, t) => n + Number(t.bytes), 0);
  const neonAuth = tables.filter((t) => t.schema !== "public").reduce((n, t) => n + Number(t.bytes), 0);

  const parts: UsagePart[] = [
    { key: "berkas", label: "Berkas pendaftar", hint: "Pas foto & SKL", bytes: privBytes, count: Number(priv?.n ?? 0), color: "#f59e0b" },
    { key: "gambar", label: "Gambar website & berita", hint: "Pustaka Media", bytes: pubBytes, count: Number(pub?.n ?? 0), color: "#8b5cf6" },
    { key: "pendaftar", label: "Data pendaftar", hint: "Biodata, ortu, alamat", bytes: size("Registration"), count: regCount, color: "#10b981" },
    { key: "berita", label: "Berita", hint: "Judul & isi berita", bytes: size("Post"), count: postCount, color: "#0ea5e9" },
    { key: "konten", label: "Konten website", hint: "Teks hero, guru, fasilitas, dll.", bytes: size("SiteContent"), color: "#06b6d4" },
    { key: "audit", label: "Audit log", hint: "Riwayat aktivitas admin", bytes: size("AuditLog"), count: logCount, color: "#64748b" },
    { key: "admin", label: "Admin & pengaturan", hint: "Akun admin, status PPDB, riwayat migrasi", bytes: adminTables, color: "#94a3b8" },
    { key: "neon", label: "Bawaan Neon Auth", hint: "Tabel otomatis Neon (tidak dipakai)", bytes: neonAuth, color: "#cbd5e1" },
  ];
  const used = parts.reduce((n, p) => n + p.bytes, 0);
  parts.push({ key: "sistem", label: "Sistem Postgres", hint: "Katalog bawaan database (tetap, tidak bertambah)", bytes: Math.max(0, total - used), color: "#e2e8f0" });
  return { total, parts };
}
