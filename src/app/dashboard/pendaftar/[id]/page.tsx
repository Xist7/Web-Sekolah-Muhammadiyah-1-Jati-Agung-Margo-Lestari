import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/guard";
import { db } from "@/lib/db";
import { STATUS } from "../status";
import { FollowUp } from "./follow-up";

export const dynamic = "force-dynamic";

const TZ = "Asia/Jakarta";
const fmt = (d: Date, time = false) =>
  d.toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", ...(time && { hour: "2-digit", minute: "2-digit" }), timeZone: time ? TZ : "UTC" });

function age(birth: Date) {
  const ref = new Date(Date.UTC(new Date().getUTCFullYear(), 6, 1)); // usia per 1 Juli tahun ini
  let y = ref.getUTCFullYear() - birth.getUTCFullYear();
  if (ref < new Date(Date.UTC(ref.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()))) y--;
  return y;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-xs font-semibold text-slate-500 sm:text-sm sm:font-medium">{label}</dt>
      <dd className="break-words text-slate-800">{children || <span className="text-slate-300">—</span>}</dd>
    </div>
  );
}

export default async function DetailPendaftarPage({ params }: PageProps<"/dashboard/pendaftar/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  const r = await db.registration.findUnique({ where: { id } });
  if (!r) notFound();
  const files = await db.upload.findMany({ where: { id: { in: [r.photoId, r.sklId].filter((x): x is string => !!x) } }, select: { id: true, mime: true, filename: true, size: true } });
  const photo = files.find((f) => f.id === r.photoId);
  const skl = files.find((f) => f.id === r.sklId);
  const st = STATUS[r.status];
  const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";

  return (
    <main className="mx-auto max-w-6xl space-y-5">
      <Link href="/dashboard/pendaftar" className="text-sm text-slate-500 hover:text-slate-800">← Semua pendaftar</Link>

      <div className="flex flex-wrap items-center gap-4">
        <div className="h-20 w-16 flex-none overflow-hidden rounded-xl bg-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {photo?.mime.startsWith("image/") && <img src={`/api/files/${photo.id}`} alt={`Pas foto ${r.fullName}`} className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-slate-500">{r.regNumber}</p>
          <h1 className="text-2xl font-bold break-words text-slate-800 sm:text-3xl">{r.fullName}</h1>
          <p className="text-sm text-slate-500">Mendaftar {fmt(r.createdAt, true)} WIB</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${st.cls}`}>{st.label}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className={card}>
            <h2 className="mb-1 font-semibold text-slate-800">🪪 Biodata Calon Siswa</h2>
            <dl className="divide-y divide-slate-100 text-sm">
              <Row label="NISN">{r.nisn}</Row>
              <Row label="Nama Lengkap">{r.fullName}</Row>
              <Row label="Jenis Kelamin">{r.gender === "L" ? "Laki-laki" : r.gender === "P" ? "Perempuan" : r.gender}</Row>
              <Row label="Tempat, Tanggal Lahir">{r.birthPlace}, {fmt(r.birthDate)} <span className="text-slate-400">({age(r.birthDate)} tahun per 1 Juli)</span></Row>
              <Row label="Asal Sekolah">{r.previousSchool}</Row>
              <Row label="Email">{r.email && <a href={`mailto:${r.email}`} className="text-emerald-700 hover:underline">{r.email}</a>}</Row>
            </dl>
          </section>

          <section className={card}>
            <h2 className="mb-1 font-semibold text-slate-800">👪 Orang Tua / Wali</h2>
            <dl className="divide-y divide-slate-100 text-sm">
              <Row label="Nama">{r.parentName}</Row>
              <Row label="Hubungan">{r.parentRelation}</Row>
              <Row label="WhatsApp">{r.parentPhone}</Row>
              <Row label="Pekerjaan">{r.parentJob}</Row>
              <Row label="Alamat">{r.address}</Row>
              <Row label="Tahu PPDB dari">{r.infoSource}</Row>
            </dl>
          </section>

          <section className={card}>
            <h2 className="mb-3 font-semibold text-slate-800">📎 Berkas</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Pas Foto", f: photo },
                { label: "Surat Keterangan Lulus (SKL)", f: skl },
              ].map(({ label, f }) => (
                <div key={label} className="rounded-xl border border-slate-200 p-3">
                  <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
                  {f ? (
                    <>
                      <a href={`/api/files/${f.id}`} target="_blank" className="block overflow-hidden rounded-lg bg-slate-100">
                        {f.mime.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/files/${f.id}`} alt={label} className="aspect-[4/3] w-full object-contain" />
                        ) : (
                          <span className="grid aspect-[4/3] place-items-center text-4xl">📄</span>
                        )}
                      </a>
                      <a href={`/api/files/${f.id}`} target="_blank" className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline">
                        Buka {f.mime === "application/pdf" ? "PDF" : "gambar"} ↗
                      </a>
                      <span className="ml-2 text-xs text-slate-400">{Math.max(1, Math.round(f.size / 1024))} KB</span>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">Tidak ada berkas.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <FollowUp
          reg={{ id: r.id, regNumber: r.regNumber, fullName: r.fullName, parentName: r.parentName, parentPhone: r.parentPhone, status: r.status, notes: r.notes }}
        />
      </div>
    </main>
  );
}
