import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/guard";
import { db } from "@/lib/db";
import { EditorPage } from "../editor-page";

export const dynamic = "force-dynamic";

export default async function EditBeritaPage({ params }: PageProps<"/dashboard/berita/[id]">) {
  const me = await requireAdminPage();
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();
  return <EditorPage post={post} authorName={me.name || me.email} />;
}
