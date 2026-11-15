import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareBar } from "@/components/berita/share-bar";
import { countWords, formatTanggal, plainText, renderContent } from "@/lib/berita/format";
import { getPostBySlug } from "@/lib/berita/queries";
import "../berita.css";

export const revalidate = 300;

// Gambar contoh bila admin belum mengunggah sampul
const CONTOH_SAMPUL = "/berita/contoh-sampul.svg";

// Halaman dibuat saat pertama dibuka lalu di-cache (cepat); diperbarui saat admin menyimpan berita
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/berita/[slug]">): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return { title: "Berita tidak ditemukan" };
  const description = post.subtitle || plainText(post.content).slice(0, 160);
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: "article", images: post.coverUrl ? [post.coverUrl] : undefined },
  };
}

export default async function BeritaDetailPage({ params }: PageProps<"/berita/[slug]">) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  const menit = Math.max(1, Math.round(countWords(plainText(post.content)) / 200));
  const cover = post.coverUrl || CONTOH_SAMPUL;

  return (
    <main>
      <header className="post-hero">
        <div className="container post-hero-inner">
          <nav className="post-crumb" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/berita">Berita</Link>
            <span>/</span>
            <span aria-current="page">{post.title}</span>
          </nav>
          {post.category && <p className="post-tag">{post.category}</p>}
          <h1>{post.title}</h1>
          <div className="post-info">
            <time dateTime={post.publishedAt?.toISOString()}>{formatTanggal(post.publishedAt)}</time>
            {post.author && <span>Oleh {post.author}</span>}
            <span>{menit} menit baca</span>
          </div>
        </div>
      </header>

      <div className="container post-layout">
        <ShareBar title={post.title} />
        <article className="post">
          <figure className="post-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={post.coverUrl ? post.title : "Contoh gambar sampul"} />
          </figure>
          {post.subtitle && <p className="lead">{post.subtitle}</p>}
          <div className="prose-berita">{renderContent(post.content)}</div>
          <Link href="/berita" className="post-back">← Kembali ke semua berita</Link>
        </article>
      </div>
    </main>
  );
}
