"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { resetContent, saveContent, uploadImage } from "@/lib/admin/content-actions";
import type { FieldDef, Media } from "@/lib/content/defaults";
import { blank } from "@/lib/content/shape";
import { compressImage } from "@/lib/image";
import { MediaPicker } from "../media/media-picker";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none";
const smallBtn = "min-h-8 min-w-8 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs hover:bg-slate-100 disabled:opacity-40";

/** Item baru: semua kosong, field media default ke mode emoji. */
function newItem(fields: FieldDef[], template: Obj): Obj {
  const item = blank(template);
  for (const f of fields) if (f.type === "media") item[f.k] = { jenis: "emoji", emoji: "⭐", gambar: "" };
  return item;
}

// ───────────────────────── Editor utama ─────────────────────────

export function ContentEditor({ sectionKey, fields, initial, template }: { sectionKey: string; fields: FieldDef[]; initial: Obj; template: Obj }) {
  const [data, setData] = useState<Obj>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [pending, start] = useTransition();
  const [dialog, confirm] = useConfirm();

  // Peringatan kalau keluar halaman sebelum menyimpan
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const update = (next: Obj) => {
    setData(next);
    setDirty(true);
    setMsg(undefined);
  };

  function save() {
    start(async () => {
      const r = await saveContent(sectionKey, JSON.stringify(data));
      setMsg({ ok: r.ok, text: r.message });
      if (r.ok) setDirty(false);
    });
  }

  async function reset() {
    const ok = await confirm({
      title: "Kembalikan ke isi bawaan?",
      message: "Semua teks, gambar, dan poin di bagian ini akan diganti isi bawaan. Perubahan Anda akan hilang.",
      confirmText: "Ya, kembalikan",
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      const r = await resetContent(sectionKey);
      setMsg({ ok: r.ok, text: r.message });
      if (r.ok) {
        setData(template);
        setDirty(false);
      }
    });
  }

  return (
    <div className="space-y-5 pb-28">
      {dialog}
      <FieldsGrid fields={fields} value={data} template={template} onChange={update} card />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-[var(--sb)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className={`text-sm ${msg ? (msg.ok ? "text-emerald-700" : "text-red-600") : dirty ? "text-amber-600" : "text-slate-500"}`} aria-live="polite">
            {msg?.text ?? (dirty ? "● Ada perubahan yang belum disimpan" : "Semua perubahan tersimpan")}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={reset} disabled={pending} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-60">
              Kembalikan Bawaan
            </button>
            <button type="button" onClick={save} disabled={pending || !dirty} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              {pending ? "Menyimpan…" : "💾 Simpan & Terbitkan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Kumpulan field ─────────────────────────

function FieldsGrid({ fields, value, template, onChange, card }: { fields: FieldDef[]; value: Obj; template: Obj; onChange: (v: Obj) => void; card?: boolean }) {
  const set = (k: string, v: Json) => onChange({ ...value, [k]: v });
  const simple = fields.filter((f) => f.type !== "list" && f.type !== "strings");
  const lists = fields.filter((f) => f.type === "list" || f.type === "strings");

  const grid = (
    <div className="grid gap-4 md:grid-cols-2">
      {simple.map((f) => (
        <FieldInput key={f.k} def={f} value={value[f.k]} onChange={(v) => set(f.k, v)} />
      ))}
    </div>
  );

  return (
    <>
      {simple.length > 0 && (card ? <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">{grid}</section> : grid)}
      {lists.map((f) =>
        f.type === "list" ? (
          <ListEditor key={f.k} def={f} value={(value[f.k] as Obj[]) ?? []} template={(template[f.k] as Obj[])[0]} onChange={(v) => set(f.k, v)} />
        ) : (
          <StringsEditor key={f.k} def={f} value={(value[f.k] as string[]) ?? []} onChange={(v) => set(f.k, v)} />
        ),
      )}
    </>
  );
}

function Label({ htmlFor, def }: { htmlFor?: string; def: FieldDef }) {
  return (
    <>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-slate-700">{def.label}</label>
      {def.help && <p className="mb-1.5 text-[11px] text-slate-400">{def.help}</p>}
    </>
  );
}

function FieldInput({ def, value, onChange }: { def: FieldDef; value: Json; onChange: (v: Json) => void }) {
  const id = useId();
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (def.type) {
    case "media":
      return <MediaInput def={def} value={value as unknown as Media} onChange={(m) => onChange(m as unknown as Json)} />;
    case "image":
      return (
        <div>
          <Label def={def} />
          <ImageInput value={str} onChange={onChange} />
        </div>
      );
    case "textarea":
      return (
        <div className="md:col-span-2">
          <Label htmlFor={id} def={def} />
          <textarea id={id} rows={Math.min(10, Math.max(3, Math.ceil(str.length / 90) + str.split("\n").length - 1))} className={inputCls} value={str} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "number":
      return (
        <div>
          <Label htmlFor={id} def={def} />
          <input id={id} type="number" min={0} className={inputCls} value={Number(value) || 0} onChange={(e) => onChange(Number(e.target.value))} />
        </div>
      );
    case "date":
      return (
        <div>
          <Label htmlFor={id} def={def} />
          <input id={id} type="date" className={inputCls} value={str} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    default:
      return (
        <div>
          <Label htmlFor={id} def={def} />
          <input id={id} type="text" inputMode={def.type === "url" ? "url" : undefined} className={inputCls} value={str} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}

// ───────────────────────── Daftar poin (replicator) ─────────────────────────

function ListEditor({ def, value, template, onChange }: { def: Extract<FieldDef, { type: "list" }>; value: Obj[]; template: Obj; onChange: (v: Obj[]) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dialog, confirm] = useConfirm();

  const titleOf = (item: Obj, i: number) => {
    const t = def.titleKey ? item[def.titleKey] : undefined;
    return typeof t === "string" && t.trim() ? t : `${def.itemLabel} #${i + 1}`;
  };
  const mediaKey = def.fields.find((f) => f.type === "media" || f.type === "image")?.k;

  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    if (openIdx === i) setOpenIdx(i + d);
  };
  const duplicate = (i: number) => {
    onChange([...value.slice(0, i + 1), structuredClone(value[i]), ...value.slice(i + 1)]);
    setOpenIdx(i + 1);
  };
  const remove = async (i: number) => {
    const ok = await confirm({
      title: `Hapus ${def.itemLabel.toLowerCase()} ini?`,
      message: <>“{titleOf(value[i], i)}” akan dihapus dari <b>{def.label}</b>.</>,
      confirmText: "Ya, hapus",
      danger: true,
    });
    if (!ok) return;
    onChange(value.filter((_, j) => j !== i));
    setOpenIdx(null);
  };
  const add = () => {
    onChange([...value, newItem(def.fields, template)]);
    setOpenIdx(value.length);
  };

  return (
    <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {dialog}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-800">
            {def.label} <span className="text-sm font-normal text-slate-400">({value.length})</span>
          </h2>
          {def.help && <p className="text-xs text-slate-400">{def.help}</p>}
        </div>
        {def.addable ? (
          <button type="button" onClick={add} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800">
            + Tambah {def.itemLabel}
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">Hanya edit</span>
        )}
      </div>

      {value.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada {def.itemLabel.toLowerCase()}.</p>}

      <ol className="divide-y divide-slate-100">
        {value.map((item, i) => {
          const open = openIdx === i;
          return (
            <li key={i}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
                <button type="button" onClick={() => setOpenIdx(open ? null : i)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="text-xs text-slate-400 tabular-nums">{i + 1}.</span>
                  {mediaKey && <Thumb value={item[mediaKey]} />}
                  <span className="truncate text-sm font-medium text-slate-700">{titleOf(item, i)}</span>
                  <span className="ml-auto hidden text-xs text-slate-400 sm:inline">{open ? "▲ Tutup" : "✎ Edit"}</span>
                </button>
                {def.addable && <div className="ml-auto flex flex-none gap-1">
                  <button type="button" className={smallBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naikkan">↑</button>
                  <button type="button" className={smallBtn} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Turunkan">↓</button>
                  <button type="button" className={smallBtn} onClick={() => duplicate(i)} aria-label="Gandakan" title="Gandakan">⧉</button>
                  <button type="button" className={`${smallBtn} text-red-600`} onClick={() => remove(i)}>Hapus</button>
                </div>}
              </div>
              {open && (
                <div className="space-y-4 bg-slate-50 px-5 py-4">
                  <FieldsGrid fields={def.fields} value={item} template={template} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Thumb({ value }: { value: Json }) {
  const m = typeof value === "string" ? { jenis: "gambar", gambar: value, emoji: "" } : (value as unknown as Media | null);
  const img = m?.jenis === "gambar" && m.gambar;
  return (
    <span className="grid h-8 w-8 flex-none place-items-center overflow-hidden rounded-md bg-emerald-50 text-base">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img ? <img src={m.gambar} alt="" className="h-full w-full object-cover" /> : m?.emoji || "·"}
    </span>
  );
}

function StringsEditor({ def, value, onChange }: { def: Extract<FieldDef, { type: "strings" }>; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">{def.label}</h2>
        <button type="button" onClick={() => onChange([...value, ""])} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white">+ Tambah</button>
      </div>
      <ul className="space-y-2">
        {value.map((s, i) => (
          <li key={i} className="flex gap-2">
            <input aria-label={`${def.label} ${i + 1}`} className={inputCls} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" className={`${smallBtn} text-red-600`} onClick={() => onChange(value.filter((_, j) => j !== i))}>Hapus</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ───────────────────────── Media: Emoji / Gambar ─────────────────────────

const EMOJI_PICKS = ["🏫", "🏢", "📚", "🔬", "🖥️", "🕌", "🏀", "⚽", "🎨", "🎶", "🤖", "🌱", "🥋", "🎤", "🏅", "🏆", "🥇", "⭐", "📅", "🎓", "👩‍🏫", "📰", "📋", "🌿"];

function MediaInput({ def, value, onChange }: { def: FieldDef; value: Media | null; onChange: (m: Media) => void }) {
  const m: Media = { jenis: value?.jenis === "gambar" ? "gambar" : "emoji", emoji: value?.emoji ?? "", gambar: value?.gambar ?? "" };
  const id = useId();
  const tab = (jenis: "emoji" | "gambar", label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={m.jenis === jenis}
      onClick={() => onChange({ ...m, jenis })}
      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${m.jenis === jenis ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="md:col-span-2">
      <Label def={def} />
      <div role="radiogroup" aria-label={`Jenis ${def.label}`} className="mb-3 flex max-w-xs gap-1 rounded-lg bg-slate-100 p-1">
        {tab("emoji", "😀 Emoji")}
        {tab("gambar", "🖼️ Gambar")}
      </div>
      {m.jenis === "emoji" ? (
        <div className="flex flex-wrap items-center gap-3">
          <input id={id} aria-label="Emoji" className={`${inputCls} w-20 text-center text-xl`} value={m.emoji} onChange={(e) => onChange({ ...m, emoji: e.target.value })} />
          <div className="flex flex-wrap gap-1">
            {EMOJI_PICKS.map((e) => (
              <button key={e} type="button" onClick={() => onChange({ ...m, emoji: e })} className={`grid h-8 w-8 place-items-center rounded-md text-lg hover:bg-emerald-50 ${m.emoji === e ? "bg-emerald-100 ring-1 ring-emerald-400" : ""}`} aria-label={`Pilih ${e}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <ImageInput value={m.gambar} onChange={(url) => onChange({ ...m, gambar: url })} />
          {!m.gambar && <p className="mt-1 text-[11px] text-amber-600">Belum ada gambar — sementara website menampilkan emoji {m.emoji || "bawaan"}.</p>}
        </>
      )}
    </div>
  );
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  async function pick(file?: File) {
    if (!file) return;
    setErr(undefined);
    setBusy(true);
    try {
      // Foto website: kompres JPEG 70%, maks. 1920 px
      const small = await compressImage(file, { quality: 0.7, maxSide: 1920 });
      const fd = new FormData();
      fd.set("file", small);
      const r = await uploadImage(fd);
      if (r.ok) onChange(r.url);
      else setErr(r.message);
    } catch {
      setErr("Gagal mengunggah. Coba lagi.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="grid h-20 w-28 flex-none place-items-center overflow-hidden rounded-lg bg-slate-200 text-[11px] text-slate-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="Pratinjau" className="h-full w-full object-cover" /> : "Belum ada gambar"}
      </div>
      <div className="flex flex-col gap-1">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
        <button type="button" className={smallBtn} disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Mengunggah…" : "⬆ Unggah Baru"}
        </button>
        <button type="button" className={smallBtn} disabled={busy} onClick={() => setPicking(true)}>
          🖼️ Pilih dari Media
        </button>
        {picking && <MediaPicker onPick={(url) => { onChange(url); setPicking(false); }} onClose={() => setPicking(false)} />}
        {value && (
          <button type="button" className={`${smallBtn} text-red-600`} disabled={busy} onClick={() => onChange("")}>
            Hapus Gambar
          </button>
        )}
        <span className="text-[10px] text-slate-400">JPG/PNG/WEBP, otomatis dikompres</span>
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </div>
  );
}
