import { getDashboardStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const statusLabel = { PENDING: "Menunggu", ACCEPTED: "Diterima", REJECTED: "Ditolak" } as const;
const statusClass = {
  PENDING: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
} as const;

export default async function DashboardPage() {
  const { total, byStatus, latest, profile, ppdb } = await getDashboardStats();

  const stats = [
    { label: "Total Pendaftar", value: total },
    { label: "Menunggu", value: byStatus.PENDING },
    { label: "Diterima", value: byStatus.ACCEPTED },
    { label: "Ditolak", value: byStatus.REJECTED },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard PPDB</h1>
        <p className="text-sm text-slate-500">
          PPDB {ppdb?.academicYear || "-"}: {ppdb?.isOpen ? "dibuka" : "ditutup"} · {profile?.studentCount ?? 0} siswa · {profile?.classCount ?? 0} kelas
        </p>
      </div>

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
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">Asal Sekolah</th>
                  <th className="px-5 py-3 font-medium">No. HP Ortu</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latest.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium text-slate-700">{r.fullName}</td>
                    <td className="px-5 py-3 text-slate-600">{r.previousSchool}</td>
                    <td className="px-5 py-3 text-slate-600">{r.parentPhone}</td>
                    <td className="px-5 py-3 text-slate-600">{r.createdAt.toLocaleDateString("id-ID")}</td>
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
