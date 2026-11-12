import type { Metadata } from "next";
import Link from "next/link";
import { formatTanggal } from "@/lib/berita/format";
import { getPublishedPosts } from "@/lib/berita/queries";
import "./berita.css";

export const revalidate = 300;

export const metadata: Metadata = { title: "Berita & Agenda" };

// Diperbarui otomatis saat admin menerbitkan berita (revalidatePath)
export default async function BeritaPage() {
  const posts = await getPublishedPosts(60);

  return (
    <main className="container berita-wrap">
      <div className="section-head berita-head">
        <p className="eyebrow">Kabar Sekolah</p>
        <h1 className="section-title">Berita &amp; Agenda Kegiatan</h1>
      </div>
      {posts.length === 0 ? (
        <p className="berita-empty">Belum ada berita yang diterbitkan.</p>
      ) : (
        <div className="berita-grid">
          {posts.map((p) => (
            <Link key={p.id} href={`/berita/${p.slug}`} className="berita-card">
              <div className="cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.coverUrl ? <img src={p.coverUrl} alt="" loading="lazy" /> : "📰"}
              </div>
              <div className="body">
                <div className="berita-meta">
                  <time dateTime={p.publishedAt?.toISOString()}>{formatTanggal(p.publishedAt)}</time>
                  {p.category && <b>• {p.category}</b>}
                </div>
                <h2>{p.title}</h2>
                {p.subtitle && <p>{p.subtitle}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
