"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; ok: boolean; text: string };
type Listener = (t: Toast) => void;

const listeners = new Set<Listener>();
let seq = 0;

function emit(ok: boolean, text: string) {
  const t = { id: ++seq, ok, text };
  listeners.forEach((l) => l(t));
}

/** Notifikasi kecil di kanan bawah. Hijau = berhasil, merah = gagal. */
export const toast = {
  success: (text: string) => emit(true, text),
  error: (text: string) => emit(false, text),
  /** Langsung dari hasil server action ({ ok, message }). */
  result: (r: { ok: boolean; message: string }) => emit(r.ok, r.message),
};

/** Dipasang sekali di shell admin. */
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const add: Listener = (t) => {
      setItems((xs) => [...xs.slice(-3), t]); // maks. 4 sekaligus
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== t.id)), t.ok ? 3500 : 6000);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 bottom-20 z-[90] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2 sm:bottom-24" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          role={t.ok ? "status" : "alert"}
          className={`pointer-events-auto flex animate-[toast-in_.2s_ease-out] items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${t.ok ? "bg-emerald-600" : "bg-red-600"}`}
        >
          <span className="text-base leading-5" aria-hidden="true">{t.ok ? "✓" : "✕"}</span>
          <span className="flex-1">{t.text}</span>
          <button type="button" onClick={() => setItems((xs) => xs.filter((x) => x.id !== t.id))} className="-mr-1 opacity-70 hover:opacity-100" aria-label="Tutup notifikasi">
            ×
          </button>
        </div>
      ))}
      <style>{"@keyframes toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"}</style>
    </div>
  );
}
