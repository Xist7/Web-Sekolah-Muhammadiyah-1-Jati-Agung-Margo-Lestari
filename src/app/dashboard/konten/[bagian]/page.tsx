import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/guard";
import { isContentKey, sections } from "@/lib/content/defaults";
import { getContent } from "@/lib/content/get";
import { ContentEditor } from "../content-editor";

export const dynamic = "force-dynamic";

export default async function EditBagianPage({ params }: PageProps<"/dashboard/konten/[bagian]">) {
  await requireAdminPage();
  const { bagian } = await params;
  if (!isContentKey(bagian)) notFound();
  const s = sections[bagian];
  const data = await getContent(bagian);
  const preview = s.group === "beranda" && s.anchor ? `/#${s.anchor}` : bagian === "ppdb" ? "/ppdb" : "/";

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Pengaturan</p>
          <h1 className="text-2xl font-bold text-slate-800">
            <span aria-hidden="true">{s.icon}</span> {s.label}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{s.description}</p>
        </div>
        <a href={preview} target="_blank" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Lihat di Website ↗
        </a>
      </div>
      {/* key: reset state editor saat pindah bagian */}
      <ContentEditor key={bagian} sectionKey={bagian} fields={s.fields} initial={data} template={s.defaults} />
    </main>
  );
}
