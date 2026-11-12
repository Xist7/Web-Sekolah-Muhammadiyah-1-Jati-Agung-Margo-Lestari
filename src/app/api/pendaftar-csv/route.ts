import { getCurrentAdmin } from "@/lib/admin/guard";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";

const STATUS = { PENDING: "Menunggu", ACCEPTED: "Diterima", REJECTED: "Ditolak" } as const;

/** Rekap pendaftar untuk dibuka di Excel. Pemisah ";" + BOM agar Excel (format Indonesia) membaca kolom & huruf dengan benar. */
export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return new Response("Forbidden", { status: 403 });

  const rows = await db.registration.findMany({ orderBy: { createdAt: "asc" }, omit: { photoId: true, sklId: true } });
  const cell = (v: unknown) => {
    const s = v instanceof Date ? v.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : String(v ?? "");
    // Cegah formula injection di Excel + escape tanda kutip
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const header = ["No. Pendaftaran", "Tanggal Daftar", "Status", "NISN", "Nama Lengkap", "L/P", "Tempat Lahir", "Tanggal Lahir", "Asal Sekolah", "Email", "Nama Orang Tua", "Hubungan", "No. WhatsApp", "Pekerjaan", "Alamat", "Tahu PPDB Dari", "Catatan Panitia"];
  const lines = rows.map((r) =>
    [
      r.regNumber, r.createdAt, STATUS[r.status], `\t${r.nisn}`, r.fullName, r.gender, r.birthPlace,
      r.birthDate.toISOString().slice(0, 10), r.previousSchool, r.email, r.parentName, r.parentRelation,
      `\t${r.parentPhone}`, r.parentJob, r.address, r.infoSource, r.notes,
    ].map(cell).join(";"),
  );
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  await logAudit(me, "UPDATE", "mengunduh rekap pendaftar (CSV)", `${rows.length} pendaftar`);

  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pendaftar-ppdb-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
