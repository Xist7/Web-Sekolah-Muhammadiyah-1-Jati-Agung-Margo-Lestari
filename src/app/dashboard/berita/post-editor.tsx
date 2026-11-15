"use client";

import { toast } from "@/components/admin/toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { savePost } from "@/lib/admin/post-actions";
import { countWords, renderContent, slugify } from "@/lib/berita/format";
import { ImageInput } from "../konten/content-editor";
import { MediaPicker } from "../media/media-picker";

export type EditablePost = {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  coverUrl: string;
  category: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string; // "YYYY-MM-DDTHH:mm" (zona lokal) atau ""
  author: string;
};

type Tool = "bold" | "italic" | "h2" | "h3" | "ul" | "ol" | "quote" | "link" | "image";
const TOOLS: { label: string; title: string; action: Tool }[] = [
  { label: "B", title: "Tebal", action: "bold" },
  { label: "I", title: "Miring", action: "italic" },
  { label: "H2", title: "Subjudul", action: "h2" },
  { label: "H3", title: "Sub-subjudul", action: "h3" },
  { label: "• List", title: "Daftar poin", action: "ul" },
  { label: "1. List", title: "Daftar bernomor", action: "ol" },
  { label: "❝", title: "Kutipan", action: "quote" },
  { label: "🔗", title: "Tautan", action: "link" },
  { label: "🖼️ Gambar", title: "Sisipkan gambar dari media", action: "image" },
];

const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none";
const card = "rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200";

export function PostEditor({ initial, categories }: { initial: EditablePost; categories: string[] }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [tab, setTab] = useState<"tulis" | "pratinjau">("tulis");
  const [picking, setPicking] = useState(false);
  const [pending, start] = useTransition();
  const area = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof EditablePost>(k: K, v: EditablePost[K]) => {
    setP((x) => ({ ...x, [k]: v }));
    setDirty(true);
    setMsg(undefined);
  };

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  function save(publish: boolean) {
    start(async () => {
      const r = await savePost({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        content: p.content,
        coverUrl: p.coverUrl,
        category: p.category,
        slug: p.slug,
        publish,
        publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
      });
      toast.result(r);
      setMsg(r.ok ? undefined : { ok: false, text: r.message });
      if (!r.ok) return;
      setDirty(false);
      setP((x) => ({ ...x, id: r.id, slug: r.slug, status: publish ? "PUBLISHED" : "DRAFT" }));
      if (!p.id) router.replace(`/dashboard/berita/${r.id}`);
      else router.refresh();
    });
  }

  /** Bungkus teks terpilih / sisipkan blok di posisi kursor. */
  function wrap(before: string, after = before, placeholder = "teks") {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    set("content", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }
  function block(text: string) {
    const el = area.current;
    const v = p.content;
    const pos = el?.selectionStart ?? v.length;
    const pre = v.slice(0, pos).replace(/\s*$/, "");
    const post = v.slice(pos).replace(/^\s*/, "");
    const next = `${pre}${pre ? "\n\n" : ""}${text}\n\n${post}`;
    set("content", next);
    requestAnimationFrame(() => el?.focus());
  }
  const prefixLines = (prefix: (i: number) => string) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || "poin";
    block(sel.split("\n").map((l, i) => prefix(i) + l).join("\n"));
  };

  function runTool(action: Tool) {
    switch (action) {
      case "bold": return wrap("**");
      case "italic": return wrap("*");
      case "h2": return block("## Subjudul");
      case "h3": return block("### Sub-subjudul");
      case "ul": return prefixLines(() => "- ");
      case "ol": return prefixLines((i) => `${i + 1}. `);
      case "quote": return prefixLines(() => "> ");
      case "link": return wrap("[", "](https://)", "teks tautan");
      case "image": return setPicking(true);
    }
  }

  const words = countWords(p.content);
  const slugPreview = p.slug || slugify(p.title) || "judul-berita";

  return (
    <div className="grid gap-6 pb-24 xl:grid-cols-[1fr_340px]">
      {/* Kolom utama */}
      <div className="space-y-4">
        <textarea
          value={p.title}
          onChange={(e) => set("title", e.target.value.replace(/\n/g, " "))}
          placeholder="Judul berita"
          aria-label="Judul berita"
          rows={2}
          className="w-full resize-none border-0 bg-transparent text-3xl leading-tight font-bold text-slate-800 placeholder:text-slate-300 focus:ring-0 focus:outline-none"
        />
        <textarea
          value={p.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          placeholder="Subjudul / ringkasan singkat (tampil di bawah judul dan di kartu berita)"
          aria-label="Subjudul"
          rows={2}
          className="w-full resize-none border-0 bg-transparent text-lg text-slate-500 placeholder:text-slate-300 focus:ring-0 focus:outline-none"
        />

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mr-2 flex rounded-lg bg-slate-200 p-0.5" role="tablist">
              {(["tulis", "pratinjau"] as const).map((t) => (
                <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${tab === t ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500"}`}>
                  {t}
                </button>
              ))}
            </div>
            {tab === "tulis" &&
              TOOLS.map((t) => (
                <button key={t.title} type="button" title={t.title} aria-label={t.title} onClick={() => runTool(t.action)} className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white hover:shadow-sm">
                  {t.label}
                </button>
              ))}
          </div>
          {tab === "tulis" ? (
            <textarea
              ref={area}
              value={p.content}
              onChange={(e) => set("content", e.target.value)}
              aria-label="Isi berita"
              placeholder={"Tulis isi berita di sini…\n\nPisahkan paragraf dengan baris kosong. Gunakan tombol di atas untuk subjudul, tebal, daftar, dan gambar."}
              className="block min-h-[480px] w-full resize-y border-0 p-5 text-[15px] leading-relaxed text-slate-800 focus:ring-0 focus:outline-none"
            />
          ) : (
            <article className="prose-berita min-h-[480px] p-5">{p.content.trim() ? renderContent(p.content) : <p className="text-slate-400">Belum ada isi.</p>}</article>
          )}
          <p className="border-t border-slate-100 px-5 py-2 text-right text-xs text-slate-400">{words} kata</p>
        </div>
        {picking && (
          <MediaPicker
            onClose={() => setPicking(false)}
            onPick={(url) => {
              setPicking(false);
              setTab("tulis");
              block(`![Keterangan gambar](${url})`);
            }}
          />
        )}
      </div>

      {/* Panel samping */}
      <aside className="space-y-4">
        <section className={card}>
          <h2 className="mb-2 font-semibold text-slate-800">Status</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {p.status === "PUBLISHED" ? "Terbit" : "Draf"}
          </span>
          <label className="mt-3 block text-xs font-semibold text-slate-600" htmlFor="pub-at">Tanggal terbit</label>
          <input id="pub-at" type="datetime-local" value={p.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={`${field} mt-1`} />
          <p className="mt-1 text-[11px] text-slate-400">Kosongkan untuk memakai waktu saat diterbitkan.</p>
          {p.author && <p className="mt-2 text-sm text-slate-500">Penulis: {p.author}</p>}
        </section>

        <section className={card}>
          <h2 className="mb-1 font-semibold text-slate-800">Gambar Sampul</h2>
          <p className="mb-3 text-[11px] text-slate-400">Tampil di atas berita & di kartu daftar berita. Rasio 16:9 disarankan.</p>
          <ImageInput value={p.coverUrl} onChange={(v) => set("coverUrl", v)} />
        </section>

        <section className={card}>
          <h2 className="mb-2 font-semibold text-slate-800">Kategori</h2>
          <input list="kategori-berita" value={p.category} onChange={(e) => set("category", e.target.value)} placeholder="mis. Kegiatan, Prestasi, Pengumuman" aria-label="Kategori" className={field} />
          <datalist id="kategori-berita">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </section>

        <section className={card}>
          <h2 className="mb-2 font-semibold text-slate-800">Alamat (slug)</h2>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 text-sm">
            <span className="bg-slate-100 px-2 py-2 text-slate-500">/berita/</span>
            <input value={p.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder={slugify(p.title) || "otomatis-dari-judul"} aria-label="Slug" className="min-w-0 flex-1 px-2 py-2 focus:outline-none" />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Kosongkan agar dibuat dari judul.</p>
          {p.status === "PUBLISHED" && p.id && (
            <a href={`/berita/${slugPreview}`} target="_blank" className="mt-2 inline-block text-xs text-emerald-700 hover:underline">Lihat di website ↗</a>
          )}
        </section>
      </aside>

      {/* Bar simpan */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-[var(--sb)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className={`text-sm ${msg ? (msg.ok ? "text-emerald-700" : "text-red-600") : dirty ? "text-amber-600" : "text-slate-500"}`} aria-live="polite">
            {msg?.text ?? (dirty ? "● Ada perubahan yang belum disimpan" : "Semua perubahan tersimpan")}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={pending} onClick={() => save(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-60">
              {p.status === "PUBLISHED" ? "Jadikan Draf" : "Simpan Draf"}
            </button>
            <button type="button" disabled={pending} onClick={() => save(true)} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              {pending ? "Menyimpan…" : p.status === "PUBLISHED" ? "Perbarui" : "🚀 Terbitkan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
