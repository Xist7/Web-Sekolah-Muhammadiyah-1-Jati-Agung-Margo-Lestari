"use client";

import { useState, useTransition } from "react";
import { setPpdbOpen } from "@/lib/admin/content-actions";

export function PpdbToggle({ isOpen }: { isOpen: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>();

  function toggle() {
    const next = !isOpen;
    if (!confirm(next ? "Buka pendaftaran PPDB sekarang?" : "Tutup pendaftaran PPDB? Formulir di website akan disembunyikan.")) return;
    start(async () => {
      const r = await setPpdbOpen(next);
      setMsg(r.message);
    });
  }

  return (
    <section
      className={`flex flex-wrap items-center justify-between gap-4 rounded-xl p-5 shadow-sm ring-1 ${
        isOpen ? "bg-emerald-50 ring-emerald-200" : "bg-red-50 ring-red-200"
      }`}
    >
      <div>
        <p className="text-sm text-slate-500">Status Pendaftaran Siswa Baru</p>
        <p className={`text-xl font-bold ${isOpen ? "text-emerald-700" : "text-red-700"}`}>
          {isOpen ? "🟢 DIBUKA" : "🔴 DITUTUP"}
        </p>
        {msg && <p className="mt-1 text-xs text-slate-500">{msg}</p>}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
          isOpen ? "bg-red-600 hover:bg-red-700" : "bg-emerald-700 hover:bg-emerald-800"
        }`}
      >
        {pending ? "Menyimpan…" : isOpen ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
      </button>
    </section>
  );
}
