import { requireAdminPage } from "@/lib/admin/guard";
import { getDashboardStats } from "@/lib/admin/queries";
import { PpdbToggle } from "./ppdb-toggle";

export const dynamic = "force-dynamic";

const statusLabel = { PENDING: "Menunggu", ACCEPTED: "Diterima", REJECTED: "Ditolak" } as const;
const statusClass = {
  PENDING: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
} as const;

export default async function DashboardPage() {
  await requireAdminPage();
  const { total, byStatus, latest, profile, ppdb } = await getDashboardStats();

  const stats = [
    { label: "Total Pendaftar", value: total },
    { label: "Menunggu", value: byStatus.PENDING },
    { label: "Diterima", value: byStatus.ACCEPTED },
    { label: "Ditolak", value: byStatus.REJECTED },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard PPDB</h1>
        <p className="text-sm text-slate-500">
          PPDB {ppdb?.academicYear || "-"}: {ppdb?.isOpen ? "dibuka" : "ditutup"} · {profile?.studentCount ?? 0} siswa · {profile?.classCount ?? 0} kelas
        </p>
      </div>

      <PpdbToggle isOpen={!!ppdb?.isOpen} />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-700">Pendaftar Terbaru</h2>
        {latest.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada pendaftar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">No. Daftar</th>
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">Asal Sekolah</th>
                  <th className="px-5 py-3 font-medium">No. HP Ortu</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Berkas</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latest.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{r.regNumber}</td>
                    <td className="px-5 py-3 font-medium"><a href={`/dashboard/pendaftar/${r.id}`} className="text-emerald-800 hover:underline">{r.fullName}</a></td>
                    <td className="px-5 py-3 text-slate-600">{r.previousSchool}</td>
                    <td className="px-5 py-3 text-slate-600">{r.parentPhone}</td>
                    <td className="px-5 py-3 text-slate-600">{r.createdAt.toLocaleDateString("id-ID")}</td>
                    <td className="space-x-2 px-5 py-3 whitespace-nowrap">
                      {r.photoId && <a className="text-emerald-700 underline" href={`/api/files/${r.photoId}`} target="_blank">Foto</a>}
                      {r.sklId && <a className="text-emerald-700 underline" href={`/api/files/${r.sklId}`} target="_blank">SKL</a>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[r.status]}`}>
                        {statusLabel[r.status]}
                      </span>
                    </td>
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
