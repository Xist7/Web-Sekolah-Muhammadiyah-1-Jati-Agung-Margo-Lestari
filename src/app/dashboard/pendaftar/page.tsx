import Link from "next/link";
import type { RegistrationStatus } from "@/generated/prisma/client";
import { requireAdminPage } from "@/lib/admin/guard";
import { listRegistrations } from "@/lib/admin/queries";
import { db } from "@/lib/db";
import { STATUS } from "./status";

export const dynamic = "force-dynamic";

const tabs: { key: string; label: string; status?: RegistrationStatus }[] = [
  { key: "", label: "Semua" },
  { key: "menunggu", label: "Menunggu", status: "PENDING" },
  { key: "diterima", label: "Diterima", status: "ACCEPTED" },
  { key: "ditolak", label: "Ditolak", status: "REJECTED" },
];

const tgl = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

export default async function PendaftarPage({ searchParams }: PageProps<"/dashboard/pendaftar">) {
  await requireAdminPage();
  const sp = await searchParams;
  const tabKey = typeof sp.status === "string" ? sp.status : "";
  const tab = tabs.find((t) => t.key === tabKey) ?? tabs[0];
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Number(sp.page) || 1;

  const [{ items, total, totalPages }, grouped] = await Promise.all([
    listRegistrations({ status: tab.status, q, page }),
    db.registration.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s?: RegistrationStatus) => grouped.filter((g) => !s || g.status === s).reduce((n, g) => n + g._count._all, 0);
  const qs = (extra: Record<string, string | number>) =>
    `/dashboard/pendaftar?${new URLSearchParams({ ...(tab.key && { status: tab.key }), ...(q && { q }), ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) })}`;

  return (
    <main className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">PPDB</p>
          <h1 className="text-3xl font-bold text-slate-800">Pendaftar</h1>
          <p className="text-sm text-slate-500">Tindak lanjuti calon siswa: cek berkas, hubungi orang tua, lalu tandai Diterima / Ditolak.</p>
        </div>
        <a href="/api/pendaftar-csv" className="rounded-full border border-emerald-700 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
          ⬇ Unduh Excel (CSV)
        </a>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0" aria-label="Filter status">
        {tabs.map((t) => {
          const active = t.key === tab.key;
          return (
            <Link
              key={t.key}
              href={`/dashboard/pendaftar${t.key ? `?status=${t.key}` : ""}`}
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${active ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {t.label} <span className="text-xs text-slate-400">({count(t.status)})</span>
            </Link>
          );
        })}
      </nav>

      <form className="flex max-w-lg gap-2" role="search">
        {tab.key && <input type="hidden" name="status" value={tab.key} />}
        <input name="q" defaultValue={q} placeholder="Cari nama, no. pendaftaran, NISN, asal SD, orang tua…" aria-label="Cari pendaftar" className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm" />
        <button className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Cari</button>
      </form>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {items.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-slate-400">{q ? `Tidak ada pendaftar yang cocok dengan “${q}”.` : "Belum ada pendaftar."}</p>
        ) : (
          <>
            {/* Desktop & tablet: tabel */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">No. Daftar</th>
                  <th className="px-5 py-3 font-medium">Nama Calon Siswa</th>
                  <th className="px-5 py-3 font-medium">Asal Sekolah</th>
                  <th className="px-5 py-3 font-medium">Orang Tua</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-emerald-50/40">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500"><Link href={`/dashboard/pendaftar/${r.id}`} className="block">{r.regNumber}</Link></td>
                    <td className="px-5 py-3"><Link href={`/dashboard/pendaftar/${r.id}`} className="font-semibold text-emerald-800 hover:underline">{r.fullName}</Link></td>
                    <td className="px-5 py-3 text-slate-600">{r.previousSchool}</td>
                    <td className="px-5 py-3 text-slate-600">{r.parentName}<span className="block text-xs text-slate-400">{r.parentPhone}</span></td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{tgl(r.createdAt)}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* HP: kartu */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {items.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/pendaftar/${r.id}`} className="block px-4 py-4 active:bg-slate-50">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-emerald-800">{r.fullName}</p>
                      <span className={`flex-none rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-slate-400">{r.regNumber} · {tgl(r.createdAt)}</p>
                    <p className="mt-1 text-sm text-slate-600">{r.previousSchool} · Ortu: {r.parentName}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Halaman">
          <span className="text-slate-500">Halaman {page} dari {totalPages} · {total} pendaftar</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className="rounded-lg border border-slate-300 bg-white px-4 py-2">← Sebelumnya</Link>}
            {page < totalPages && <Link href={qs({ page: page + 1 })} className="rounded-lg border border-slate-300 bg-white px-4 py-2">Berikutnya →</Link>}
          </div>
        </nav>
      )}
    </main>
  );
}
