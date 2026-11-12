import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdminPage } from "@/lib/admin/guard";
import { formatTanggal } from "@/lib/berita/format";
import { db } from "@/lib/db";
import { DeletePostButton } from "./delete-button";

export const dynamic = "force-dynamic";

const tabs = [
  { key: "", label: "Semua" },
  { key: "draf", label: "Draf" },
  { key: "terbit", label: "Terbit" },
] as const;

export default async function BeritaAdminPage({ searchParams }: PageProps<"/dashboard/berita">) {
  await requireAdminPage();
  const sp = await searchParams;
  const status = sp.status === "draf" ? "DRAFT" : sp.status === "terbit" ? "PUBLISHED" : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.PostWhereInput = {
    ...(status && { status }),
    ...(q && { title: { contains: q, mode: "insensitive" } }),
  };
  const [posts, counts] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
      select: { id: true, title: true, slug: true, category: true, coverUrl: true, status: true, author: true, publishedAt: true, updatedAt: true },
    }),
    db.post.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s?: string) => counts.filter((c) => !s || c.status === s).reduce((n, c) => n + c._count._all, 0);
  const activeTab = typeof sp.status === "string" ? sp.status : "";

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Konten Website</p>
          <h1 className="text-3xl font-bold text-slate-800">Berita</h1>
          <p className="text-sm text-slate-500">Berita & kegiatan sekolah yang tampil di website. Simpan sebagai draf dulu bila belum siap terbit.</p>
        </div>
        <Link href="/dashboard/berita/baru" className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">
          + Tulis Berita
        </Link>
      </div>

      <nav className="flex gap-1 border-b border-slate-200" aria-label="Filter status">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          const n = count(t.key === "draf" ? "DRAFT" : t.key === "terbit" ? "PUBLISHED" : undefined);
          return (
            <Link
              key={t.key}
              href={`/dashboard/berita${t.key ? `?status=${t.key}` : ""}`}
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${active ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {t.label} <span className="text-xs text-slate-400">({n})</span>
            </Link>
          );
        })}
      </nav>

      <form className="flex max-w-md gap-2" role="search">
        {activeTab && <input type="hidden" name="status" value={activeTab} />}
        <input name="q" defaultValue={q} placeholder="Cari judul…" aria-label="Cari judul berita" className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm" />
        <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">Cari</button>
      </form>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {posts.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-400">
            {q ? `Tidak ada berita dengan judul “${q}”.` : "Belum ada berita. Klik “+ Tulis Berita” untuk membuat yang pertama."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Judul</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Penulis</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/berita/${p.id}`} className="flex items-center gap-3">
                        <span className="grid h-12 w-20 flex-none place-items-center overflow-hidden rounded-md bg-emerald-50 text-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.coverUrl ? <img src={p.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : "📰"}
                        </span>
                        <span>
                          <span className="line-clamp-2 font-semibold text-emerald-800 hover:underline">{p.title}</span>
                          {p.category && <span className="text-xs text-slate-400">{p.category}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {p.status === "PUBLISHED" ? "Terbit" : "Draf"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.author || "—"}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{formatTanggal(p.publishedAt ?? p.updatedAt, true)}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {p.status === "PUBLISHED" && (
                        <a href={`/berita/${p.slug}`} target="_blank" className="mr-3 text-xs text-slate-500 hover:underline">Lihat ↗</a>
                      )}
                      <DeletePostButton id={p.id} title={p.title} />
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
