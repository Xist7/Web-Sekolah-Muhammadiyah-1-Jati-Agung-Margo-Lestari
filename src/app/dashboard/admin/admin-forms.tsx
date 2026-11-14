"use client";

import { toast } from "@/components/admin/toast";
import { useActionState, useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { addAdmin, deleteAdmin, setAdminActive } from "@/lib/admin/admin-actions";

const input =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none";

export function AddAdminForm() {
  const [state, action, pending] = useActionState(async (prev: Awaited<ReturnType<typeof addAdmin>> | null, fd: FormData) => {
    const r = await addAdmin(prev, fd);
    toast.result(r);
    return r;
  }, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="min-w-60 flex-1">
        <label htmlFor="new-email" className="mb-1 block text-xs font-semibold text-slate-600">Email Google admin baru</label>
        <input id="new-email" name="email" type="email" required placeholder="nama@gmail.com" className={`${input} w-full`} />
      </div>
      <button disabled={pending} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        {pending ? "Menyimpan…" : "+ Tambah Admin"}
      </button>
      {state && (
        <p className={`w-full text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`} role="status">{state.message}</p>
      )}
    </form>
  );
}

type Admin = { id: string; email: string; name: string; isActive: boolean; lastLogin: string };

export function AdminRow({ admin, isMe }: { admin: Admin; isMe: boolean }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [pending, start] = useTransition();
  const [dialog, confirm] = useConfirm();

  const toggle = () =>
    start(async () => {
      const r = await setAdminActive(admin.id, !admin.isActive);
      toast.result(r);
      setMsg({ ok: r.ok, text: r.message });
    });

  const remove = async () => {
    const ok = await confirm({ title: "Hapus admin?", message: <><b>{admin.email}</b> tidak akan bisa login ke panel admin lagi.</>, confirmText: "Ya, hapus", danger: true });
    if (!ok) return;
    start(async () => {
      const r = await deleteAdmin(admin.id);
      toast.result(r);
      if (!r.ok) setMsg({ ok: false, text: r.message });
    });
  };

  return (
    <tr className="align-top">
      <td className="px-5 py-3">
        <p className="font-medium text-slate-700">{admin.email} {isMe && <span className="text-xs text-emerald-700">(Anda)</span>}</p>
        {admin.name && <p className="text-xs text-slate-400">{admin.name}</p>}
        {dialog}
        {msg && <p className={`mt-1 text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      </td>
      <td className="px-5 py-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${admin.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
          {admin.isActive ? "Aktif" : "Nonaktif"}
        </span>
      </td>
      <td className="px-5 py-3 whitespace-nowrap text-slate-500">{admin.lastLogin}</td>
      <td className="space-x-2 px-5 py-3 whitespace-nowrap">
        <button type="button" onClick={toggle} disabled={isMe || pending} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40">
          {admin.isActive ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button type="button" onClick={remove} disabled={isMe || pending} className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40">
          Hapus
        </button>
      </td>
    </tr>
  );
}
