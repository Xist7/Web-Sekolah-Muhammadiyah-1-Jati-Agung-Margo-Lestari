"use client";

import { toast } from "@/components/admin/toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { deletePost } from "@/lib/admin/post-actions";

export function DeletePostButton({ id, title, redirectTo }: { id: string; title: string; redirectTo?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [dialog, confirm] = useConfirm();

  async function onClick() {
    const ok = await confirm({ title: "Hapus berita?", message: <>“{title}” akan dihapus permanen dari website.</>, confirmText: "Ya, hapus", danger: true });
    if (!ok) return;
    start(async () => {
      const r = await deletePost(id);
      toast.result(r);
      if (r.ok && redirectTo) router.replace(redirectTo);
      else router.refresh();
    });
  }

  return (
    <>
      {dialog}
      <button type="button" onClick={onClick} disabled={pending} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">
        {pending ? "Menghapus…" : "Hapus"}
      </button>
    </>
  );
}
