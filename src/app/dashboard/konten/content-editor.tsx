"use client";

import { useId, useRef, useState, useTransition } from "react";
import { resetContent, saveContent, uploadImage } from "@/lib/admin/content-actions";
import { compressImage } from "@/lib/image";
import { blank } from "@/lib/content/shape";

type Json = string | number | boolean | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

/** "kepalaSekolahFoto" → "Kepala Sekolah Foto" */
const humanize = (k: string) =>
  k.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

const isImageKey = (k: string) => k === "foto" || k === "logo" || k.endsWith("Foto");
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none";
const smallBtn = "rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-40";

export function ContentEditor({ sectionKey, initial, template }: { sectionKey: string; initial: Obj; template: Obj }) {
  const [data, setData] = useState<Obj>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [pending, start] = useTransition();

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

  function reset() {
    if (!confirm("Kembalikan SEMUA isi bagian ini ke teks & foto bawaan?")) return;
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
    <div className="space-y-4 pb-24">
      <ObjectFields value={data} template={template} onChange={update} />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className={`text-sm ${msg ? (msg.ok ? "text-emerald-700" : "text-red-600") : "text-slate-500"}`} aria-live="polite">
            {msg?.text ?? (dirty ? "Ada perubahan yang belum disimpan." : "Belum ada perubahan.")}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={reset} disabled={pending} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-60">
              Kembalikan Bawaan
            </button>
            <button type="button" onClick={save} disabled={pending || !dirty} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              {pending ? "Menyimpan…" : "💾 Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectFields({ value, template, onChange }: { value: Obj; template: Obj; onChange: (v: Obj) => void }) {
  const keys = Object.keys(template);
  const scalars = keys.filter((k) => !Array.isArray(template[k]));
  const lists = keys.filter((k) => Array.isArray(template[k]));
  const set = (k: string, v: Json) => onChange({ ...value, [k]: v });

  return (
    <>
      {scalars.length > 0 && (
        <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:grid-cols-2">
          {scalars.map((k) => (
            <Field key={k} name={k} value={value[k]} template={template[k]} onChange={(v) => set(k, v)} />
          ))}
        </section>
      )}
      {lists.map((k) => (
        <ListField key={k} name={k} value={value[k] as Json[]} template={template[k] as Json[]} onChange={(v) => set(k, v)} />
      ))}
    </>
  );
}

function Field({ name, value, template, onChange }: { name: string; value: Json; template: Json; onChange: (v: Json) => void }) {
  const id = useId();
  const label = <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-600">{humanize(name)}</label>;

  if (isImageKey(name)) return <ImageField id={id} label={humanize(name)} value={String(value ?? "")} onChange={onChange} />;

  if (typeof template === "number") {
    return (
      <div>
        {label}
        <input id={id} type="number" min={0} className={inputCls} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    );
  }

  const str = String(value ?? "");
  if (name === "tanggal") {
    return (
      <div>
        {label}
        <input id={id} type="date" className={inputCls} value={str} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }

  const long = String(template).length > 70 || String(template).includes("\n") || str.length > 70;
  return (
    <div className={long ? "md:col-span-2" : undefined}>
      {label}
      {long ? (
        <textarea id={id} rows={Math.min(8, Math.max(3, Math.ceil(str.length / 90)))} className={inputCls} value={str} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type="text" className={inputCls} value={str} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function ListField({ name, value, template, onChange }: { name: string; value: Json[]; template: Json[]; onChange: (v: Json[]) => void }) {
  const itemTpl = template[0];
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const remove = (i: number) => {
    if (confirm("Hapus poin ini?")) onChange(value.filter((_, j) => j !== i));
  };
  const add = () => onChange([...value, blank(itemTpl)]);

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-slate-700">
          {humanize(name)} <span className="text-sm font-normal text-slate-400">({value.length} poin)</span>
        </h2>
        <button type="button" onClick={add} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800">
          + Tambah
        </button>
      </div>
      {value.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Belum ada poin. Klik “+ Tambah”.</p>}
      <ol className="space-y-3">
        {value.map((item, i) => (
          <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">#{i + 1}</span>
              <div className="flex gap-1">
                <button type="button" className={smallBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naikkan">↑</button>
                <button type="button" className={smallBtn} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Turunkan">↓</button>
                <button type="button" className={`${smallBtn} text-red-600`} onClick={() => remove(i)}>Hapus</button>
              </div>
            </div>
            {isObj(itemTpl) ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Object.keys(itemTpl).map((k) => (
                  <Field
                    key={k}
                    name={k}
                    value={(item as Obj)[k]}
                    template={itemTpl[k]}
                    onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...(x as Obj), [k]: v } : x)))}
                  />
                ))}
              </div>
            ) : (
              <input
                type="text"
                aria-label={`${humanize(name)} #${i + 1}`}
                className={inputCls}
                value={String(item)}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function ImageField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
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
    <div>
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-28 flex-none place-items-center overflow-hidden rounded-lg bg-slate-200 text-xs text-slate-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : "Belum ada foto"}
        </div>
        <div className="flex flex-col gap-1">
          <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          <button type="button" className={smallBtn} disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Mengunggah…" : value ? "Ganti Foto" : "Unggah Foto"}
          </button>
          {value && (
            <button type="button" className={`${smallBtn} text-red-600`} disabled={busy} onClick={() => onChange("")}>
              Hapus Foto
            </button>
          )}
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
      </div>
    </div>
  );
}
