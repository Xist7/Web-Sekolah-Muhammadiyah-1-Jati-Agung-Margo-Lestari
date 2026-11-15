"use client";

import { toast } from "@/components/admin/toast";
import { useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { setPpdbOpen } from "@/lib/admin/content-actions";
import { formatDeadline, parseDeadline } from "@/lib/ppdb/deadline";

/** Tanggal hari ini di WIB, format YYYY-MM-DD (batas minimal input tanggal) */
const todayWib = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

const input = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none";

/**
 * Buka / tutup PPDB. Saat membuka, admin wajib mengisi tanggal tutup (jam opsional);
 * setelah lewat, pendaftaran tertutup otomatis.
 */
export function PpdbToggle({ isOpen, expired, deadline }: { isOpen: boolean; expired: boolean; deadline: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>();
  const [form, setForm] = useState(false); // form tanggal tutup tampil
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [dialog, confirm] = useConfirm();

  const preview = date ? parseDeadline(date, time) : null;
  const previewLabel = preview ? formatDeadline(preview, !!time) : "";
  const previewPast = !!preview && preview <= new Date();

  async function close() {
    const ok = await confirm({ title: "Tutup pendaftaran PPDB?", message: "Formulir di website akan disembunyikan dan kiriman baru ditolak.", confirmText: "Ya, tutup pendaftaran", danger: true, icon: "🔒" });
    if (!ok) return;
    start(async () => {
      const r = await setPpdbOpen(false);
      toast.result(r);
      setMsg(r.ok ? undefined : r.message);
    });
  }

  async function open() {
    if (!preview || previewPast) return;
    const ok = await confirm({
      title: "Buka pendaftaran PPDB?",
      message: (
        <>
          Formulir pendaftaran langsung tampil di website dan otomatis <b>ditutup</b> setelah <b>{previewLabel}</b>
          {time ? "" : " berakhir"}.
        </>
      ),
      confirmText: "Ya, buka pendaftaran",
      icon: "🟢",
    });
    if (!ok) return;
    start(async () => {
      const r = await setPpdbOpen(true, { date, time });
      toast.result(r);
      setMsg(r.ok ? undefined : r.message);
      if (r.ok) setForm(false);
    });
  }

  return (
    <>
      {dialog}
      <section className={`rounded-xl p-5 shadow-sm ring-1 ${isOpen ? "bg-emerald-50 ring-emerald-200" : "bg-red-50 ring-red-200"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Status Pendaftaran Siswa Baru</p>
            <p className={`text-xl font-bold ${isOpen ? "text-emerald-700" : "text-red-700"}`}>{isOpen ? "🟢 DIBUKA" : "🔴 DITUTUP"}</p>
            {isOpen && deadline && <p className="mt-0.5 text-sm text-emerald-800">Otomatis ditutup setelah <b>{deadline}</b></p>}
            {expired && <p className="mt-0.5 text-sm text-red-700">Ditutup otomatis — batas waktu {deadline} sudah lewat.</p>}
            {msg && <p className="mt-1 text-xs text-slate-500">{msg}</p>}
          </div>
          {isOpen ? (
            <button type="button" onClick={close} disabled={pending} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {pending ? "Menyimpan…" : "Tutup Pendaftaran"}
            </button>
          ) : (
            !form && (
              <button type="button" onClick={() => setForm(true)} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
                Buka Pendaftaran
              </button>
            )
          )}
        </div>

        {!isOpen && form && (
          <form
            className="mt-4 space-y-3 rounded-lg bg-white p-4 ring-1 ring-slate-200"
            onSubmit={(e) => {
              e.preventDefault();
              open();
            }}
          >
            <p className="text-sm font-semibold text-slate-700">Pendaftaran dibuka sampai kapan?</p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold text-slate-600">
                Tanggal tutup <span className="text-red-600">*</span>
                <input type="date" required min={todayWib()} value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 block ${input}`} />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Jam tutup <span className="font-normal text-slate-400">(opsional, WIB)</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`mt-1 block ${input}`} />
              </label>
              {time && (
                <button type="button" onClick={() => setTime("")} className="pb-2 text-xs text-slate-500 underline">
                  hapus jam
                </button>
              )}
            </div>
            <p className={`text-xs ${previewPast ? "text-red-600" : "text-slate-500"}`}>
              {!preview
                ? "Kalau jam tidak diisi, pendaftaran tutup setelah tanggal tersebut berakhir (pukul 24.00 WIB)."
                : previewPast
                  ? "Waktu itu sudah lewat. Pilih tanggal/jam yang akan datang."
                  : <>Tutup otomatis {time ? "pada" : "setelah"} <b className="text-slate-700">{previewLabel}</b>{time ? "" : " berakhir"}.</>}
            </p>
            <div className="flex gap-2">
              <button type="submit" disabled={pending || !preview || previewPast} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                {pending ? "Menyimpan…" : "Buka Pendaftaran"}
              </button>
              <button type="button" onClick={() => setForm(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                Batal
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
