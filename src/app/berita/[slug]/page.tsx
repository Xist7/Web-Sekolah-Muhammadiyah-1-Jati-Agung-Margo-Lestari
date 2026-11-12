import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTanggal, plainText, renderContent } from "@/lib/berita/format";
import { getPostBySlug } from "@/lib/berita/queries";
import "../berita.css";

export const revalidate = 300;

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
  const wa = `https://wa.me/?text=${encodeURIComponent(post.title)}`;

  return (
    <main className="container berita-wrap">
      <article className="post">
        <Link href="/berita" className="post-back">← Semua berita</Link>
        <div className="berita-meta">
          <time dateTime={post.publishedAt?.toISOString()}>{formatTanggal(post.publishedAt)}</time>
          {post.category && <b>• {post.category}</b>}
          {post.author && <span>• Oleh {post.author}</span>}
        </div>
        <h1>{post.title}</h1>
        {post.subtitle && <p className="lead">{post.subtitle}</p>}
        {post.coverUrl && (
          <div className="post-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverUrl} alt={post.title} />
          </div>
        )}
        <div className="prose-berita">{renderContent(post.content)}</div>
        <div className="post-share">
          <span>Bagikan:</span>
          <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </article>
    </main>
  );
}
