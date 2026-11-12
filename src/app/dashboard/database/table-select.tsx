"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Dropdown pilih tabel; langsung pindah saat dipilih. */
export function TableSelect({ value, options }: { value: string; options: { value: string; label: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="pilih-tabel" className="text-sm font-semibold text-slate-600">Tabel</label>
      <select
        id="pilih-tabel"
        value={value}
        disabled={pending}
        onChange={(e) => start(() => router.push(`/dashboard/database?tabel=${e.target.value}`))}
        className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label} ({o.value})</option>
        ))}
      </select>
      {pending && <span className="text-xs text-slate-400">Memuat…</span>}
    </div>
  );
}
