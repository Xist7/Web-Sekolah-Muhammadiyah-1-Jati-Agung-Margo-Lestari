import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdminPage } from "@/lib/admin/guard";
import { AUDIT_MAX_ROWS } from "@/lib/audit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACTIONS: Record<string, { label: string; icon: string; tone: string }> = {
  LOGIN: { label: "Masuk", icon: "🔑", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  LOGOUT: { label: "Keluar", icon: "🚪", tone: "bg-slate-100 text-slate-600 ring-slate-200" },
  CREATE: { label: "Tambah Data", icon: "➕", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  UPDATE: { label: "Ubah Data", icon: "✏️", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  DELETE: { label: "Hapus Data", icon: "🗑️", tone: "bg-red-50 text-red-700 ring-red-200" },
  UPLOAD: { label: "Unggah Gambar", icon: "🖼️", tone: "bg-violet-50 text-violet-700 ring-violet-200" },
  PUBLISH: { label: "Terbitkan", icon: "🚀", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  OPEN: { label: "Buka PPDB", icon: "🟢", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  CLOSE: { label: "Tutup PPDB", icon: "🔒", tone: "bg-red-50 text-red-700 ring-red-200" },
};

const TZ = "Asia/Jakarta";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD (WIB)

function dayLabel(key: string) {
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  if (key === today) return "Hari ini";
  if (key === yesterday) return "Kemarin";
  return new Date(`${key}T12:00:00+07:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}

function ago(d: Date) {
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86_400) return `${Math.floor(s / 3600)} jam lalu`;
  if (s < 2_592_000) return `${Math.floor(s / 86_400)} hari lalu`;
  return `${Math.floor(s / 2_592_000)} bulan lalu`;
}

const initials = (name: string) =>
  name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none";

export default async function AuditLogPage({ searchParams }: PageProps<"/dashboard/audit-log">) {
  await requireAdminPage();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");
  const role = str("role");
  const dari = str("dari");
  const sampai = str("sampai");
  const q = str("q");
  const limit = Math.min(1000, Math.max(100, Number(str("limit")) || 100));

  const where: Prisma.AuditLogWhereInput = {
    ...(role === "admin" && { actorRole: "ADMIN" }),
    ...((dari || sampai) && {
      createdAt: {
        ...(dari && { gte: new Date(`${dari}T00:00:00+07:00`) }),
        ...(sampai && { lte: new Date(`${sampai}T23:59:59.999+07:00`) }),
      },
    }),
    ...(q && {
      OR: [
        { actorName: { contains: q, mode: "insensitive" } },
        { actorEmail: { contains: q, mode: "insensitive" } },
        { target: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [logs, total, totalAll] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: limit }),
    db.auditLog.count({ where }),
    db.auditLog.count(),
  ]);

  // Kelompokkan per hari (WIB)
  const groups: { key: string; items: typeof logs }[] = [];
  for (const l of logs) {
    const k = dayKey(l.createdAt);
    if (groups.at(-1)?.key !== k) groups.push({ key: k, items: [] });
    groups.at(-1)!.items.push(l);
  }

  const logPct = Math.min(100, (totalAll / AUDIT_MAX_ROWS) * 100);
  const moreHref = `/dashboard/audit-log?${new URLSearchParams({ ...(role && { role }), ...(dari && { dari }), ...(sampai && { sampai }), ...(q && { q }), limit: String(limit + 100) })}`;

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Sistem</p>
        <h1 className="text-3xl font-bold text-slate-800">Audit Log</h1>
        <p className="text-sm text-slate-500">Riwayat aktivitas admin di panel: login, perubahan konten, berita, media, pendaftaran, dan pengguna.</p>
      </div>

      {/* Kapasitas audit log (pemakaian database ada di menu Database) */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-slate-600">Kapasitas audit log</p>
            <p className="text-sm text-slate-500"><b className="text-slate-800">{totalAll.toLocaleString("id-ID")}</b> / {AUDIT_MAX_ROWS.toLocaleString("id-ID")}</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(logPct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.max(logPct, 1)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">Saat penuh, aktivitas terlama otomatis dihapus. Pemakaian database: lihat menu <Link href="/dashboard/database" className="text-emerald-700 underline">Database</Link>.</p>
        </div>
      </section>

      {/* Filter */}
      <form className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 md:grid-cols-[180px_1fr_1.3fr_auto] md:items-end">
          <div>
            <label htmlFor="f-role" className="mb-1 block text-xs font-semibold text-slate-600">Filter by Role</label>
            <select id="f-role" name="role" defaultValue={role} className={input}>
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-600">Rentang Tanggal</span>
            <div className="flex items-center gap-2">
              <input type="date" name="dari" defaultValue={dari} aria-label="Dari tanggal" className={input} />
              <span className="text-xs text-slate-400">s/d</span>
              <input type="date" name="sampai" defaultValue={sampai} aria-label="Sampai tanggal" className={input} />
            </div>
          </div>
          <div>
            <label htmlFor="f-q" className="mb-1 block text-xs font-semibold text-slate-600">Cari User</label>
            <input id="f-q" name="q" defaultValue={q} placeholder="🔍 Nama, email, atau target…" className={input} />
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700">Cari</button>
            {(role || dari || sampai || q) && (
              <Link href="/dashboard/audit-log" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Reset</Link>
            )}
          </div>
        </div>
        <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
          Menampilkan <b className="text-slate-800">{logs.length}</b> dari {total.toLocaleString("id-ID")} aktivitas
        </p>
      </form>

      {/* Daftar aktivitas */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {groups.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-slate-400">Belum ada aktivitas{q || dari || sampai ? " yang cocok dengan filter" : ""}.</p>
        ) : (
          groups.map((g) => (
            <div key={g.key}>
              <h2 className="border-y border-slate-100 bg-slate-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-slate-500 uppercase first:border-t-0">{dayLabel(g.key)}</h2>
              <ul className="divide-y divide-slate-100">
                {g.items.map((l) => {
                  const a = ACTIONS[l.action] ?? { label: l.action, icon: "•", tone: "bg-slate-100 text-slate-600 ring-slate-200" };
                  const who = l.actorName || l.actorEmail;
                  return (
                    <li key={l.id} className="flex gap-4 px-5 py-4">
                      <span className={`grid h-11 w-11 flex-none place-items-center rounded-full text-lg ring-1 ${a.tone}`} aria-hidden="true">{a.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                          <p className="text-[15px] text-slate-700">
                            <b className="font-semibold text-slate-900">{who}</b> {l.summary}
                            {l.target && <> — <span className="font-medium text-slate-900">“{l.target}”</span></>}
                          </p>
                          <time dateTime={l.createdAt.toISOString()} className="text-xs whitespace-nowrap text-slate-400" title={l.createdAt.toLocaleString("id-ID", { timeZone: TZ })}>
                            {l.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: TZ })} · {ago(l.createdAt)}
                          </time>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className={`rounded-full px-2.5 py-0.5 font-semibold ring-1 ${a.tone}`}>{a.label}</span>
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-slate-200 px-1 text-[9px] font-bold text-slate-600">{initials(who)}</span>
                          <span className="text-slate-500">{l.actorRole === "ADMIN" ? "Admin" : l.actorRole}</span>
                          {l.actorName && <span className="truncate text-slate-400">{l.actorEmail}</span>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
        {logs.length < total && (
          <div className="border-t border-slate-100 p-4 text-center">
            <Link href={moreHref} scroll={false} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Tampilkan 100 lagi</Link>
          </div>
        )}
      </section>
    </main>
  );
}
