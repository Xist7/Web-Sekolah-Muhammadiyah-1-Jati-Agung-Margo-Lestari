import { requireAdminPage } from "@/lib/admin/guard";
import { listMedia } from "@/lib/admin/content-actions";
import { MediaLibrary } from "./media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdminPage();
  const items = await listMedia();
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Pengaturan</p>
        <h1 className="text-2xl font-bold text-slate-800">Media</h1>
        <p className="text-sm text-slate-500">
          Tempat penyimpanan gambar website ({items.length} gambar). Gambar otomatis dikompres saat diunggah, lalu bisa dipilih di
          editor konten dan berita lewat tombol “Pilih dari Media”.
        </p>
      </div>
      <MediaLibrary items={items} />
    </main>
  );
}
