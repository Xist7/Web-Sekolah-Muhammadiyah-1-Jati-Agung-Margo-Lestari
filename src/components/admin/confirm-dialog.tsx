"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Options = {
  title: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** merah untuk aksi berbahaya (hapus / tutup) */
  danger?: boolean;
  icon?: string;
  /** detik tunggu sebelum tombol konfirmasi bisa diklik (supaya pesan benar-benar dibaca) */
  delay?: number;
};

/**
 * Pengganti window.confirm(): card di tengah layar.
 *   const [dialog, confirm] = useConfirm();
 *   if (await confirm({ title: "Hapus?" })) { ... }
 *   return <>{dialog} ...</>;
 */
export function useConfirm() {
  const [opts, setOpts] = useState<Options | null>(null);
  const resolver = useRef<(v: boolean) => void>(undefined);

  const confirm = useCallback((o: Options) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((v: boolean) => {
    resolver.current?.(v);
    resolver.current = undefined;
    setOpts(null);
  }, []);

  const dialog = opts ? <ConfirmCard {...opts} onClose={close} /> : null;
  return [dialog, confirm] as const;
}

function ConfirmCard({ title, message, confirmText = "Ya, lanjutkan", cancelText = "Batal", danger, icon, delay = 0, onClose }: Options & { onClose: (v: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [left, setLeft] = useState(delay);
  const locked = left > 0;

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal(); // modal asli: fokus terkunci di dalam, Esc = batal
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => { e.preventDefault(); onClose(false); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(false); }} // klik latar = batal
      className="m-auto w-[calc(100%-32px)] max-w-md rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 text-center">
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl ${danger ? "bg-red-100" : "bg-emerald-100"}`} aria-hidden="true">
          {icon ?? (danger ? "⚠️" : "❓")}
        </div>
        <h2 id="confirm-title" className="mt-4 text-lg font-bold text-slate-800">{title}</h2>
        {message && <div className="mt-2 text-sm text-slate-500">{message}</div>}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <button type="button" autoFocus={delay > 0} onClick={() => onClose(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          {cancelText}
        </button>
        <button
          type="button"
          autoFocus={delay === 0}
          disabled={locked}
          onClick={() => onClose(true)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white tabular-nums disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "bg-red-600 enabled:hover:bg-red-700" : "bg-emerald-700 enabled:hover:bg-emerald-800"}`}
        >
          {locked ? `${confirmText} (${left})` : confirmText}
        </button>
      </div>
    </dialog>
  );
}
