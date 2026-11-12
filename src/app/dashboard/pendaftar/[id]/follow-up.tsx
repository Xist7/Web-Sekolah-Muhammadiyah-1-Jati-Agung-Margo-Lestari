"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { deletePendaftar, updatePendaftar } from "@/lib/admin/pendaftar-actions";

type Status = "PENDING" | "ACCEPTED" | "REJECTED";
type Reg = { id: string; regNumber: string; fullName: string; parentName: string; parentPhone: string; status: Status; notes: string };

const OPTIONS: { value: Status; label: string; icon: string; on: string }[] = [
  { value: "PENDING", label: "Menunggu", icon: "⏳", on: "border-amber-400 bg-amber-50 text-amber-800" },
  { value: "ACCEPTED", label: "Diterima", icon: "✅", on: "border-emerald-500 bg-emerald-50 text-emerald-800" },
  { value: "REJECTED", label: "Ditolak", icon: "❌", on: "border-red-400 bg-red-50 text-red-700" },
];

/** 08xx / +628xx / 628xx → 628xx (format wa.me) */
const waNumber = (p: string) => p.replace(/\D/g, "").replace(/^0/, "62");

function waMessage(r: Reg, status: Status) {
  const head = `Assalamu'alaikum Bapak/Ibu ${r.parentName}.\n\nKami panitia PPDB SMP Muhammadiyah 1 Jati Agung, terkait pendaftaran ananda *${r.fullName}* (No. ${r.regNumber}).`;
  if (status === "ACCEPTED")
    return `${head}\n\nAlhamdulillah, ananda dinyatakan *DITERIMA*. Mohon datang ke sekolah untuk daftar ulang dengan membawa berkas asli. Terima kasih.`;
  if (status === "REJECTED")
    return `${head}\n\nMohon maaf, pendaftaran ananda belum dapat kami terima. Untuk informasi lebih lanjut silakan hubungi panitia. Terima kasih.`;
  return `${head}\n\nPendaftaran sudah kami terima dan sedang diverifikasi. Kami akan mengabari kembali. Terima kasih.`;
}

export function FollowUp({ reg }: { reg: Reg }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(reg.status);
  const [notes, setNotes] = useState(reg.notes);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [pending, start] = useTransition();
  const [dialog, confirm] = useConfirm();
  const dirty = status !== reg.status || notes !== reg.notes;

  function save() {
    start(async () => {
      const r = await updatePendaftar({ id: reg.id, status, notes });
      setMsg({ ok: r.ok, text: r.message });
      if (r.ok) router.refresh();
    });
  }

  async function remove() {
    const ok = await confirm({
      title: "Hapus data pendaftar?",
      message: <>Data <b>{reg.fullName}</b> ({reg.regNumber}) beserta pas foto & SKL akan dihapus permanen.</>,
      confirmText: "Ya, hapus",
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      const r = await deletePendaftar(reg.id);
      if (r.ok) router.replace("/dashboard/pendaftar");
      else setMsg({ ok: false, text: r.message });
    });
  }

  const wa = `https://wa.me/${waNumber(reg.parentPhone)}?text=${encodeURIComponent(waMessage(reg, status))}`;

  return (
    <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
      {dialog}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-800">Tindak Lanjut</h2>
        <p className="mb-3 text-xs text-slate-500">Pilih hasil verifikasi, beri catatan, lalu simpan.</p>

        <div role="radiogroup" aria-label="Status pendaftar" className="grid grid-cols-3 gap-2">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={status === o.value}
              onClick={() => { setStatus(o.value); setMsg(undefined); }}
              className={`rounded-xl border-2 px-2 py-3 text-center text-xs font-semibold transition ${status === o.value ? o.on : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >
              <span className="block text-lg" aria-hidden="true">{o.icon}</span>
              {o.label}
            </button>
          ))}
        </div>

        <label htmlFor="catatan" className="mt-4 mb-1 block text-xs font-semibold text-slate-600">Catatan panitia (tidak terlihat orang tua)</label>
        <textarea
          id="catatan"
          rows={4}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setMsg(undefined); }}
          placeholder="mis. Berkas lengkap, sudah ditelepon 13 Nov, jadwal daftar ulang 20 Nov."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
        />

        {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`} role="status">{msg.text}</p>}
        <button type="button" onClick={save} disabled={!dirty || pending} className="mt-3 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {pending ? "Menyimpan…" : "💾 Simpan Tindak Lanjut"}
        </button>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-800">Hubungi Orang Tua</h2>
        <p className="mb-3 text-xs text-slate-500">
          {reg.parentName} · {reg.parentPhone}. Pesan otomatis menyesuaikan status <b>{OPTIONS.find((o) => o.value === status)?.label}</b> dan masih bisa diedit di WhatsApp.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1ebe5b]">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2z" /></svg>
          Kirim WhatsApp
        </a>
      </section>

      <button type="button" onClick={remove} disabled={pending} className="w-full rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
        🗑️ Hapus Pendaftar
      </button>
    </aside>
  );
}
