import type { NextRequest } from "next/server";
import { arsipTarget } from "@/lib/admin/arsip";
import { getCurrentAdmin } from "@/lib/admin/guard";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { nomorPrefix } from "@/lib/ppdb/nomor";

const STATUS = { PENDING: "Menunggu", ACCEPTED: "Diterima", REJECTED: "Ditolak" } as const;

/**
 * Rekap pendaftar untuk dibuka di Excel (?tahun=2026 → arsip satu tahun pendaftaran saja). Pemisah ";" + BOM agar Excel (format Indonesia) membaca kolom & huruf dengan benar.
 */
export async function GET(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return new Response("Forbidden", { status: 403 });

  const tahun = req.nextUrl.searchParams.get("tahun");
  if (tahun !== null && !/^\d{4}$/.test(tahun)) return new Response("Tahun tidak valid", { status: 400 });

  const rows = await db.registration.findMany({
    where: tahun ? { regNumber: { startsWith: nomorPrefix(tahun) } } : undefined,
    orderBy: { createdAt: "asc" },
    omit: { photoId: true, sklId: true },
  });
  if (tahun && rows.length === 0) return new Response("Tidak ada data", { status: 404 });
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
  await (tahun
    ? logAudit(me, "DOWNLOAD", `mengunduh arsip pendaftar PPDB ${tahun} (CSV)`, `${arsipTarget(tahun)}${rows.length} pendaftar`)
    : logAudit(me, "DOWNLOAD", "mengunduh rekap pendaftar (CSV)", `${rows.length} pendaftar`));

  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tahun ? `arsip-ppdb-${tahun}` : "pendaftar-ppdb"}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
