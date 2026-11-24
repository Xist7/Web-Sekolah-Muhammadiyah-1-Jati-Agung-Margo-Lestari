import Link from "next/link";
import { getArsip } from "@/lib/admin/arsip";
import { requireAdminPage } from "@/lib/admin/guard";
import { DB_LIMIT_BYTES, getDbSize } from "@/lib/audit";
import { db } from "@/lib/db";
import { formatDeadline, isPpdbOpen } from "@/lib/ppdb/deadline";
import { ArsipCard } from "./arsip-card";

export const dynamic = "force-dynamic";
// Menghapus ratusan berkas + mengembalikan ruang database bisa butuh lebih dari 10 detik
export const maxDuration = 60;

const TZ = "Asia/Jakarta";
const tgl = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const waktu = (d: Date) => d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ });
const size = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default async function ArsipPage() {
  await requireAdminPage();
  const [arsip, ppdb, dbSize] = await Promise.all([
    getArsip(),
    db.ppdbInfo.findUnique({ where: { id: 1 }, select: { isOpen: true, closesAt: true, closesAtTime: true } }),
    getDbSize().catch(() => 0),
  ]);
  const open = isPpdbOpen(ppdb);
  const pct = Math.min(100, (dbSize / DB_LIMIT_BYTES) * 100);
  const steps = [
    { done: !open, text: "Tutup pendaftaran PPDB" },
    { done: !!arsip[0]?.arsipSah, text: "Unduh arsip CSV & simpan (laptop / Google Drive)" },
    { done: false, text: "Hapus data terlama, database siap untuk tahun berikutnya" },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">PPDB</p>
        <h1 className="text-3xl font-bold text-slate-800">Arsip Pendaftar</h1>
        <p className="text-sm text-slate-500">Simpan data pendaftar sebagai CSV (bisa dibuka di Excel), lalu kosongkan data terlama supaya database muat untuk pendaftar baru.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-600">Langkah pengarsipan</p>
          <ol className="mt-3 space-y-2.5">
            {steps.map((s, i) => (
              <li key={s.text} className="flex items-start gap-3 text-sm">
                <span className={`grid h-6 w-6 flex-none place-items-center rounded-full text-xs font-bold ${s.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {s.done ? "✓" : i + 1}
                </span>
                <span className={s.done ? "text-slate-400 line-through" : "text-slate-700"}>{s.text}</span>
              </li>
            ))}
          </ol>
          {open && (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
              Pendaftaran masih <b>dibuka</b>
              {ppdb?.closesAt ? <> sampai <b>{formatDeadline(ppdb.closesAt, ppdb.closesAtTime)}</b></> : null}, jadi penghapusan dikunci. CSV tetap bisa diunduh.{" "}
              <Link href="/dashboard" className="font-semibold underline">Tutup pendaftaran</Link>
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-slate-600">Database terpakai</p>
            <p className="text-sm text-slate-500"><b className="text-slate-800">{size(dbSize)}</b> / {size(DB_LIMIT_BYTES)}</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Database terpakai">
            <div className={`h-full rounded-full ${pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${Math.max(pct, 1)}%` }} />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Yang paling banyak makan tempat adalah pas foto & SKL. Keduanya <b>tidak ikut</b> di CSV; kalau masih diperlukan, unduh dulu dari halaman{" "}
            <Link href="/dashboard/pendaftar" className="text-emerald-700 underline">Pendaftar</Link>.
          </p>
        </div>
      </section>

      {arsip.length === 0 ? (
        <p className="rounded-2xl bg-white px-5 py-14 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">Belum ada data pendaftar untuk diarsipkan.</p>
      ) : (
        <section className="space-y-4" aria-label="Data per tahun pendaftaran">
          {arsip.map((a, i) => (
            <ArsipCard
              key={a.tahun}
              ppdbOpen={open}
              tahunTerlama={arsip[0].tahun}
              a={{
                tahun: a.tahun,
                total: a.total,
                pending: a.pending,
                accepted: a.accepted,
                rejected: a.rejected,
                periode: `Mendaftar ${tgl(a.dari)} – ${tgl(a.sampai)}`,
                ukuran: size(a.fileBytes),
                unduhan: a.unduhan ? `${waktu(a.unduhan.at)} WIB oleh ${a.unduhan.oleh}` : "",
                arsipSah: a.arsipSah,
                terlama: i === 0,
              }}
            />
          ))}
        </section>
      )}
    </main>
  );
}
