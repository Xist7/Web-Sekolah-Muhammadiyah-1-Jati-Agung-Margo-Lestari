import { requireAdminPage } from "@/lib/admin/guard";
import { db } from "@/lib/db";
import { TableSelect } from "./table-select";

export const dynamic = "force-dynamic";

const LIMIT = 200;

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

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Database</h1>
        <p className="text-sm text-slate-500">Tampilan isi tabel database Neon (hanya baca).</p>
      </div>

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
