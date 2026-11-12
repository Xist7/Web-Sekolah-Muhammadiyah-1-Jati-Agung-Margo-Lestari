import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { contentDefaults, contentSections, isContentKey } from "@/lib/content/defaults";
import { getContent } from "@/lib/content/get";
import { ContentEditor } from "./content-editor";

export const dynamic = "force-dynamic";

export default async function KontenPage({ searchParams }: PageProps<"/dashboard/konten">) {
  await requireAdmin();
  const { bagian } = await searchParams;
  const key = isContentKey(bagian) ? bagian : "home";
  const data = await getContent(key);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Edit Konten Website</h1>
        <p className="text-sm text-slate-500">
          Ubah teks, ganti foto, serta tambah / hapus poin (ekstrakurikuler, fasilitas, prestasi, berita, menu, dll.).
          Klik <b>Simpan</b> dan perubahan langsung tampil di website.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Bagian konten">
        {contentSections.map((s) => (
          <Link
            key={s.key}
            href={`/dashboard/konten?bagian=${s.key}`}
            aria-current={s.key === key ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              s.key === key ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      {/* key memaksa editor di-reset saat pindah bagian */}
      <ContentEditor key={key} sectionKey={key} initial={data} template={contentDefaults[key]} />
    </main>
  );
}
