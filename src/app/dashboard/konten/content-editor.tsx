"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import { resetContent, saveContent } from "@/lib/admin/content-actions";
import type { FieldDef, Media } from "@/lib/content/defaults";
import { blank } from "@/lib/content/shape";
import { MediaPicker, useUploader } from "../media/media-picker";

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
      toast.result(r);
      setMsg(r.ok ? undefined : { ok: false, text: r.message });
      if (r.ok) setDirty(false);
    });
  }

  async function reset() {
    const ok = await confirm({
      title: "Kembalikan ke isi bawaan?",
      message: "Semua teks, gambar, dan poin di bagian ini akan diganti isi bawaan. Perubahan Anda akan hilang.",
      confirmText: "Ya, kembalikan",
      danger: true,
      delay: 3,
    });
    if (!ok) return;
    start(async () => {
      const r = await resetContent(sectionKey);
      toast.result(r);
      setMsg(r.ok ? undefined : { ok: false, text: r.message });
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

// ───────────────────────── Daftar poin (drag & menu ⋮) ─────────────────────────

type MenuItem = { label: string; onClick: () => void; danger?: boolean; icon?: string };

/** Tombol ⋮ dengan menu kecil (tutup saat klik di luar / Esc). */
function RowMenu({ items, label }: { items: MenuItem[]; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", out);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", out);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu ${label}`}
        className="grid h-9 w-9 place-items-center rounded-lg text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        ⋮
      </button>
      {open && (
        <ul role="menu" className="absolute top-full right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-slate-200">
          {items.map((m) => (
            <li key={m.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  m.onClick();
                }}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left ${m.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <span className="w-5 text-center" aria-hidden="true">{m.icon}</span>
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListEditor({ def, value, template, onChange }: { def: Extract<FieldDef, { type: "list" }>; value: Obj[]; template: Obj; onChange: (v: Obj[]) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dialog, confirm] = useConfirm();
  const listRef = useRef<HTMLOListElement>(null);
  // Nilai terbaru untuk handler drag (dipasang di window)
  const latest = useRef({ value, onChange, openIdx });
  useEffect(() => {
    latest.current = { value, onChange, openIdx };
  });
  const isDragging = dragIdx !== null;
  const dragStart = useRef(0); // posisi awal baris yang sedang digeser

  const titleOf = (item: Obj, i: number) => {
    const t = def.titleKey ? item[def.titleKey] : undefined;
    return typeof t === "string" && t.trim() ? t : `${def.itemLabel} #${i + 1}`;
  };
  const mediaField = def.fields.find((f) => f.type === "media" || f.type === "image");
  const leaderKey = def.leader?.key;
  const leaderIdx = leaderKey ? value.findIndex((x) => x[leaderKey] === true) : -1;

  // ── Drag untuk mengurutkan (mouse & layar sentuh) ──
  useEffect(() => {
    if (!isDragging) return;
    let current = dragStart.current;
    const scroller = listRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
    const move = (e: PointerEvent) => {
      // Gulir otomatis saat mendekati tepi layar
      if (scroller) {
        if (e.clientY < 90) scroller.scrollBy(0, -14);
        else if (e.clientY > window.innerHeight - 110) scroller.scrollBy(0, 14);
      }
      const row = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-row]");
      if (!row || !listRef.current?.contains(row)) return;
      const target = Number(row.dataset.row);
      if (Number.isNaN(target) || target === current) return;
      const { value: v, onChange: change, openIdx: oi } = latest.current;
      const next = [...v];
      const [it] = next.splice(current, 1);
      next.splice(target, 0, it);
      change(next);
      if (oi === current) setOpenIdx(target);
      current = target;
      setDragIdx(target);
    };
    const end = () => setDragIdx(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  const duplicate = (i: number) => {
    const copy = structuredClone(value[i]);
    if (leaderKey) copy[leaderKey] = false; // salinan tidak ikut jadi kepala sekolah
    onChange([...value.slice(0, i + 1), copy, ...value.slice(i + 1)]);
    setOpenIdx(i + 1);
  };
  const remove = async (i: number) => {
    const ok = await confirm({
      title: `Hapus ${def.itemLabel.toLowerCase()} ini?`,
      message: <>“{titleOf(value[i], i)}” akan dihapus dari <b>{def.label}</b>. Klik “Simpan &amp; Terbitkan” agar tersimpan.</>,
      confirmText: "Ya, hapus",
      danger: true,
    });
    if (!ok) return;
    onChange(value.filter((_, j) => j !== i));
    setOpenIdx(null);
  };
  const setLeader = (i: number | null) => {
    if (!leaderKey) return;
    onChange(value.map((x, j) => ({ ...x, [leaderKey]: j === i })));
  };
  const add = () => {
    onChange([...value, newItem(def.fields, template)]);
    setOpenIdx(value.length);
  };

  const menuFor = (i: number): MenuItem[] => {
    const isLeader = i === leaderIdx;
    const items: MenuItem[] = [{ label: openIdx === i ? "Tutup" : "Edit", icon: "✏️", onClick: () => setOpenIdx(openIdx === i ? null : i) }];
    if (def.addable) items.push({ label: "Duplikat", icon: "⧉", onClick: () => duplicate(i) });
    if (def.leader) {
      if (isLeader) items.push({ label: `Lepas ${def.leader.label}`, icon: "✕", danger: true, onClick: () => setLeader(null) });
      else if (leaderIdx === -1) items.push({ label: `Jadikan ${def.leader.label}`, icon: "👑", onClick: () => setLeader(i) });
    }
    if (def.addable) items.push({ label: "Hapus", icon: "🗑️", danger: true, onClick: () => remove(i) });
    return items;
  };

  return (
    <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {dialog}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-800">
            {def.label} <span className="text-sm font-normal text-slate-400">({value.length})</span>
          </h2>
          {def.help && <p className="text-xs text-slate-400">{def.help}</p>}
          {def.leader && (
            <p className={`mt-1 text-xs ${leaderIdx === -1 ? "text-amber-600" : "text-slate-500"}`}>
              {leaderIdx === -1 ? (
                `⚠ Belum ada ${def.leader.label.toLowerCase()}. Buka menu ⋮ pada salah satu ${def.itemLabel.toLowerCase()} → Jadikan ${def.leader.label}.`
              ) : (
                <>👑 {def.leader.label}: <b>{titleOf(value[leaderIdx], leaderIdx)}</b></>
              )}
            </p>
          )}
        </div>
        {def.addable ? (
          <button type="button" onClick={add} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
            + Tambah {def.itemLabel}
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">Hanya edit</span>
        )}
      </div>

      {value.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada {def.itemLabel.toLowerCase()}.</p>}

      <ol ref={listRef} className="divide-y divide-slate-100">
        {value.map((item, i) => {
          const open = openIdx === i;
          const dragging = dragIdx === i;
          const isLeader = i === leaderIdx;
          return (
            <li key={i} data-row={i} className={`transition-colors ${dragging ? "relative z-10 bg-emerald-50 shadow-lg ring-2 ring-emerald-400" : ""}`}>
              <div className="flex items-center gap-2 px-2 py-2.5 sm:gap-3 sm:px-4">
                {def.addable ? (
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      dragStart.current = i;
                      setDragIdx(i);
                    }}
                    className={`grid h-9 w-7 flex-none touch-none place-items-center rounded-md text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                    aria-label={`Geser untuk mengurutkan ${titleOf(item, i)}`}
                    title="Tahan & geser untuk mengurutkan"
                  >
                    ⠿
                  </button>
                ) : (
                  <span className="w-7 flex-none text-center text-xs text-slate-400 tabular-nums">{i + 1}.</span>
                )}
                <button type="button" onClick={() => setOpenIdx(open ? null : i)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left">
                  {mediaField && <Thumb value={item[mediaField.k]} fallback={mediaField.type === "image" ? "👤" : "🖼️"} />}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-700">{titleOf(item, i)}</span>
                    {isLeader && <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">👑 {def.leader?.label}</span>}
                  </span>
                  <span className="ml-auto hidden flex-none text-xs text-slate-400 sm:inline">{open ? "▲ Tutup" : "✎ Edit"}</span>
                </button>
                {(def.addable || def.leader) && <RowMenu items={menuFor(i)} label={titleOf(item, i)} />}
              </div>
              {open && (
                <div className="space-y-4 bg-slate-50 px-4 py-4 sm:px-5">
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

function Thumb({ value, fallback }: { value: Json; fallback: string }) {
  const m = typeof value === "string" ? { jenis: "gambar", gambar: value, emoji: "" } : (value as unknown as Media | null);
  const img = m?.jenis === "gambar" && m.gambar;
  return (
    <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-lg bg-emerald-50 text-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img ? <img src={m.gambar} alt="" className="h-full w-full object-cover" /> : m?.emoji || fallback}
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
  // Unggah baru: buka editor crop dulu, lalu kompres (JPEG 70%) & simpan ke Media
  const { busy, err, upload, editor } = useUploader((done) => {
    onChange(done[0].url);
    toast.success("Gambar diunggah. Klik Simpan agar tampil di website.");
  });

  return (
    <div className="flex items-center gap-3">
      {editor}
      <div className="grid h-20 w-28 flex-none place-items-center overflow-hidden rounded-lg bg-slate-200 text-[11px] text-slate-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="Pratinjau" className="h-full w-full object-cover" /> : "Belum ada gambar"}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />
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
        <span className="text-[10px] text-slate-400">JPG/PNG/WEBP · bisa di-crop · otomatis dikompres</span>
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </div>
  );
}
