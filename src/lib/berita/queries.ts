import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

/** Kolom untuk kartu/daftar berita (tanpa isi lengkap, supaya ringan). */
const cardSelect = { id: true, slug: true, title: true, subtitle: true, coverUrl: true, category: true, publishedAt: true } as const;

/** Berita terbit terbaru — dipakai halaman /berita & bisa dipakai FE di beranda. */
export async function getPublishedPosts(limit = 12) {
  try {
    return await db.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: cardSelect,
    });
  } catch (e) {
    console.error("[berita] gagal memuat daftar", e);
    return [];
  }
}

/** Satu berita terbit berdasarkan slug (di-cache per request: dipakai metadata + halaman). */
export const getPostBySlug = cache(async (slug: string) => {
  try {
    return await db.post.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } } });
  } catch (e) {
    console.error("[berita] gagal memuat", e);
    return null;
  }
});
