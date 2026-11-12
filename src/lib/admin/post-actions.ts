"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { slugify } from "@/lib/berita/format";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "./guard";

export type PostResult = { ok: true; message: string; id: string; slug: string } | { ok: false; message: string };

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(250, "Judul terlalu panjang"),
  subtitle: z.string().trim().max(500, "Subjudul maks. 500 karakter").default(""),
  content: z.string().max(100_000, "Isi berita terlalu panjang").default(""),
  coverUrl: z.union([z.literal(""), z.string().regex(/^(\/api\/files\/[\w-]+|https?:\/\/\S+)$/, "URL gambar tidak valid")]).default(""),
  category: z.string().trim().max(60).default(""),
  slug: z.string().trim().max(100).default(""),
  publish: z.boolean(),
  publishedAt: z.string().optional(), // ISO; kosong = sekarang
});

/** Slug unik: tambahkan -2, -3, ... bila sudah dipakai berita lain. */
async function uniqueSlug(base: string, exceptId?: string) {
  const root = slugify(base) || "berita";
  for (let n = 1; ; n++) {
    const slug = n === 1 ? root : `${root}-${n}`;
    const used = await db.post.findUnique({ where: { slug }, select: { id: true } });
    if (!used || used.id === exceptId) return slug;
  }
}

function refresh(slug?: string, oldSlug?: string) {
  revalidatePath("/berita");
  revalidatePath("/");
  if (slug) revalidatePath(`/berita/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/berita/${oldSlug}`);
  revalidatePath("/dashboard/berita");
}

export async function savePost(input: z.input<typeof postSchema>): Promise<PostResult> {
  try {
    const me = await requireAdmin();
    const p = postSchema.safeParse(input);
    if (!p.success) return { ok: false, message: p.error.issues[0]?.message ?? "Isian tidak valid." };
    const d = p.data;

    const existing = d.id ? await db.post.findUnique({ where: { id: d.id }, select: { id: true, slug: true, publishedAt: true, author: true } }) : null;
    if (d.id && !existing) return { ok: false, message: "Berita tidak ditemukan (mungkin sudah dihapus)." };

    const slug = await uniqueSlug(d.slug || d.title, existing?.id);
    const when = d.publishedAt ? new Date(d.publishedAt) : null;
    const data = {
      title: d.title,
      subtitle: d.subtitle,
      content: d.content,
      coverUrl: d.coverUrl,
      category: d.category,
      slug,
      status: d.publish ? ("PUBLISHED" as const) : ("DRAFT" as const),
      publishedAt: d.publish ? (when && !Number.isNaN(when.getTime()) ? when : existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
    };

    const post = existing
      ? await db.post.update({ where: { id: existing.id }, data, select: { id: true, slug: true } })
      : await db.post.create({ data: { ...data, author: me.name || me.email }, select: { id: true, slug: true } });

    refresh(post.slug, existing?.slug);
    await logAudit(me, d.publish ? "PUBLISH" : existing ? "UPDATE" : "CREATE", d.publish ? (existing ? "memperbarui berita" : "menerbitkan berita") : existing ? "menyimpan draf berita" : "membuat draf berita", d.title);
    return { ok: true, id: post.id, slug: post.slug, message: d.publish ? "Berita diterbitkan & tampil di website." : "Draf disimpan (belum tampil di website)." };
  } catch (e) {
    if (e instanceof UnauthorizedError) return { ok: false, message: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { ok: false, message: "Alamat (slug) sudah dipakai berita lain." };
    console.error("[post save]", e);
    return { ok: false, message: "Terjadi kesalahan server. Coba lagi." };
  }
}

export async function deletePost(id: string): Promise<{ ok: boolean; message: string }> {
  try {
    const me = await requireAdmin();
    const post = await db.post.delete({ where: { id }, select: { slug: true, title: true } });
    await logAudit(me, "DELETE", "menghapus berita", post.title);
    refresh(post.slug);
    return { ok: true, message: "Berita dihapus." };
  } catch (e) {
    if (e instanceof UnauthorizedError) return { ok: false, message: e.message };
    console.error("[post delete]", e);
    return { ok: false, message: "Gagal menghapus berita." };
  }
}
