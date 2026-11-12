import Link from "next/link";
import { db } from "@/lib/db";
import "@/app/berita/berita.css";
import { DeletePostButton } from "./delete-button";
import { PostEditor, type EditablePost } from "./post-editor";

/** Untuk <input type="datetime-local">: "YYYY-MM-DDTHH:mm" dalam WIB. */
const toLocalInput = (d: Date | null) =>
  d ? new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16) : "";

/** Halaman bersama untuk tulis baru & edit berita. */
export async function EditorPage({ post, authorName }: { post?: Awaited<ReturnType<typeof db.post.findUnique>>; authorName: string }) {
  const categories = (await db.post.findMany({ where: { category: { not: "" } }, distinct: ["category"], select: { category: true }, take: 50 })).map((c) => c.category);

  const initial: EditablePost = post
    ? {
        id: post.id,
        title: post.title,
        subtitle: post.subtitle,
        content: post.content,
        coverUrl: post.coverUrl,
        category: post.category,
        slug: post.slug,
        status: post.status,
        publishedAt: toLocalInput(post.publishedAt),
        author: post.author,
      }
    : { title: "", subtitle: "", content: "", coverUrl: "", category: "", slug: "", status: "DRAFT", publishedAt: "", author: authorName };

  return (
    <main className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/dashboard/berita" className="text-sm text-slate-500 hover:text-slate-800">← Semua berita</Link>
        {post && <DeletePostButton id={post.id} title={post.title} redirectTo="/dashboard/berita" />}
      </div>
      <PostEditor initial={initial} categories={categories} />
    </main>
  );
}
