import { requireAdminPage } from "@/lib/admin/guard";
import { DB_LIMIT_BYTES, getDbBreakdown, getDbSize, getTableSizes } from "@/lib/audit";
import { db } from "@/lib/db";
import { TableSelect } from "./table-select";

export const dynamic = "force-dynamic";

const LIMIT = 200;
const fmtMB = (b: number) => `${(b / 1048576).toFixed(1)} MB`;
const fmtSize = (b: number) => (b >= 1048576 ? fmtMB(b) : `${Math.max(1, Math.round(b / 1024))} KB`);
const FALLBACK_PER_REG = 1.1 * 1048576; // hasil uji: pas foto ±250 KB + SKL PDF ±800 KB
const labelOf = (t: string) => (t in tables ? tables[t as TableName].label : t);

/** Tabel yang bisa dilihat admin (read-only). Kolom biner Upload.data tidak diambil. */
const tables = {
  Registration: { label: "Pendaftar PPDB", load: () => Promise.all([db.registration.findMany({ orderBy: { createdAt: "desc" }, take: LIMIT }), db.registration.count()]) },
  PpdbInfo: { label: "Info PPDB", load: () => Promise.all([db.ppdbInfo.findMany({ take: LIMIT }), db.ppdbInfo.count()]) },
  SiteContent: { label: "Konten Website", load: () => Promise.all([db.siteContent.findMany({ take: LIMIT }), db.siteContent.count()]) },
  Upload: {
    label: "File Unggahan",
    load: () =>
      Promise.all([
        db.upload.findMany({ orderBy: { createdAt: "desc" }, take: LIMIT, omit: { data: true } }),
        db.upload.count(),
      ]),
  },
  Post: { label: "Berita", load: () => Promise.all([db.post.findMany({ orderBy: { updatedAt: "desc" }, take: LIMIT }), db.post.count()]) },
  AuditLog: { label: "Audit Log", load: () => Promise.all([db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: LIMIT }), db.auditLog.count()]) },
  Admin: { label: "Admin", load: () => Promise.all([db.admin.findMany({ orderBy: { email: "asc" }, take: LIMIT }), db.admin.count()]) },
  SchoolProfile: { label: "Profil Sekolah", load: () => Promise.all([db.schoolProfile.findMany({ take: LIMIT }), db.schoolProfile.count()]) },
  Teacher: { label: "Guru", load: () => Promise.all([db.teacher.findMany({ take: LIMIT }), db.teacher.count()]) },
  Facility: { label: "Fasilitas", load: () => Promise.all([db.facility.findMany({ take: LIMIT }), db.facility.count()]) },
  GalleryItem: { label: "Galeri", load: () => Promise.all([db.galleryItem.findMany({ take: LIMIT }), db.galleryItem.count()]) },
} as const;

type TableName = keyof typeof tables;
const isTable = (t: unknown): t is TableName => typeof t === "string" && t in tables;

function cell(key: string, v: unknown) {
  if (v === null || v === undefined) return <span className="text-slate-300">null</span>;
  if (v instanceof Date) return v.toLocaleString("id-ID");
  if (typeof v === "boolean") return v ? "✅ true" : "❌ false";
  if ((key === "photoId" || key === "sklId") && typeof v === "string") {
    return <a className="text-emerald-700 underline" href={`/api/files/${v}`} target="_blank">lihat file</a>;
  }
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 120 ? <span title={s}>{s.slice(0, 120)}…</span> : s;
}

export default async function DatabasePage({ searchParams }: PageProps<"/dashboard/database">) {
  await requireAdminPage();
  const { tabel } = await searchParams;
  const name: TableName = isTable(tabel) ? tabel : "Registration";
  const [rows, total] = (await tables[name].load()) as [Record<string, unknown>[], number];
  const columns = rows.length ? Object.keys(rows[0]) : [];

  // Pemakaian penyimpanan
  const [dbSize, tableSizes, regCount, privFiles, usage] = await Promise.all([
    getDbSize().catch(() => 0),
    getTableSizes().catch(() => []),
    db.registration.count(),
    db.upload.aggregate({ where: { isPublic: false }, _sum: { size: true } }),
    getDbBreakdown().catch(() => null),
  ]);
  const usageParts = usage?.parts.filter((p) => p.bytes > 0) ?? [];
  const usageTotal = usage?.total || 1;
  const dbPct = Math.min(100, (dbSize / DB_LIMIT_BYTES) * 100);
  const free = Math.max(0, DB_LIMIT_BYTES - dbSize);
  // Rata-rata berkas per pendaftar dari data nyata; kalau belum ada data yang wajar pakai hasil uji
  const avgReal = regCount ? (privFiles._sum.size ?? 0) / regCount : 0;
  const perReg = avgReal > 100 * 1024 ? avgReal + 2048 : FALLBACK_PER_REG;
  const regLeft = Math.floor(free / perReg);
  const topTables = tableSizes.filter((t) => t.bytes > 0).slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Database</h1>
        <p className="text-sm text-slate-500">Tampilan isi tabel database Neon (hanya baca).</p>
      </div>

      {/* Pemakaian penyimpanan */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-slate-600">Database terpakai</p>
            <p className="text-sm text-slate-500"><b className="text-slate-800">{fmtMB(dbSize)}</b> / {fmtMB(DB_LIMIT_BYTES)}</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(dbPct)} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full ${dbPct > 80 ? "bg-red-500" : dbPct > 60 ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${Math.max(dbPct, 1)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">{dbPct.toFixed(1)}% dari kuota Neon Free. Sekitar 7–8 MB adalah bawaan sistem (tabel & indeks kosong). Di atas 80%, audit log otomatis dipangkas jadi 1.000 terbaru.</p>

          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
            <div>
              <dt className="text-[11px] text-slate-500">Sisa ruang</dt>
              <dd className="text-lg font-bold text-slate-800">{fmtMB(free)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-slate-500">Per pendaftar</dt>
              <dd className="text-lg font-bold text-slate-800">±{fmtSize(perReg)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-slate-500">Muat lagi</dt>
              <dd className="text-lg font-bold text-emerald-700">±{regLeft.toLocaleString("id-ID")}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-400">
            Yang paling banyak makan tempat adalah berkas pendaftar (pas foto & SKL). Foto berita/galeri ±200–500 KB per gambar, sedangkan data teks hampir tidak terasa.
            {avgReal > 100 * 1024 ? " Perkiraan dihitung dari rata-rata berkas pendaftar yang sudah ada." : " Perkiraan memakai ukuran umum (foto ±250 KB + SKL PDF ±800 KB)."}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-600">Dipakai untuk apa saja?</p>
          {usage ? (
            <>
              {/* Bar bertumpuk: porsi tiap kegunaan dari total terpakai */}
              <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Komposisi pemakaian database">
                {usageParts.map((p) => (
                  <span key={p.key} title={`${p.label}: ${fmtSize(p.bytes)}`} style={{ width: `${(p.bytes / usageTotal) * 100}%`, background: p.color }} />
                ))}
              </div>
              <ul className="mt-4 space-y-2.5">
                {usageParts.map((p) => (
                  <li key={p.key} className="flex items-start gap-2.5 text-xs">
                    <span className="mt-0.5 h-3 w-3 flex-none rounded-sm" style={{ background: p.color }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-slate-700">{p.label}</span>
                      {p.count !== undefined && <span className="text-slate-400"> · {p.count.toLocaleString("id-ID")}</span>}
                      <span className="block truncate text-[11px] text-slate-400">{p.hint}</span>
                    </span>
                    <span className="text-right whitespace-nowrap">
                      <b className="text-slate-800">{fmtSize(p.bytes)}</b>
                      <span className="block text-[10px] text-slate-400">{((p.bytes / usageTotal) * 100).toFixed(1)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-xs text-slate-400">Rincian belum bisa dimuat.</p>
          )}
          <details className="mt-4 border-t border-slate-100 pt-3">
            <summary className="cursor-pointer text-xs font-semibold text-emerald-700">Lihat per tabel (teknis)</summary>
            <ul className="mt-3 space-y-2.5">
              {topTables.map((t) => (
                <li key={t.name}>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="truncate text-slate-700">{labelOf(t.name)} <span className="text-slate-400">· {t.rows.toLocaleString("id-ID")} baris</span></span>
                    <span className="font-semibold whitespace-nowrap text-slate-800">{fmtSize(t.bytes)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.max(2, (t.bytes / (topTables[0]?.bytes || 1)) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      <TableSelect value={name} options={(Object.keys(tables) as TableName[]).map((t) => ({ value: t, label: tables[t].label }))} />

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-700">
          <code>{name}</code>{" "}
          <span className="text-sm font-normal text-slate-400">
            ({total} baris{total > LIMIT ? `, ditampilkan ${LIMIT} terbaru` : ""})
          </span>
        </h2>
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Tabel kosong.</p>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  {columns.map((c) => <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">{c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={i} className="align-top hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    {columns.map((c) => (
                      <td key={c} className="max-w-xs px-3 py-2 break-words text-slate-700">{cell(c, r[c])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
