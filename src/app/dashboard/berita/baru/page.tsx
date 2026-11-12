import { requireAdminPage } from "@/lib/admin/guard";
import { EditorPage } from "../editor-page";

export const dynamic = "force-dynamic";

export default async function TulisBeritaPage() {
  const me = await requireAdminPage();
  return <EditorPage authorName={me.name || me.email} />;
}
