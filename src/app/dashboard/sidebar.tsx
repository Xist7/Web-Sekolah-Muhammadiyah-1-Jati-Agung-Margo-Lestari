"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { sections, type ContentKey } from "@/lib/content/defaults";

type Item = { href: string; label: string; icon: string };

// Sub-menu "Pengaturan": satu halaman per fitur website (tiap grup bisa dibuka/tutup)
const pengaturan: { key: string; label: string; items: Item[] }[] = [
  {
    key: "beranda",
    label: "Beranda",
    items: (Object.keys(sections) as ContentKey[])
      .filter((k) => sections[k].group === "beranda")
      .map((k) => ({ href: `/dashboard/konten/${k}`, label: sections[k].label, icon: sections[k].icon })),
  },
  {
    key: "berita",
    label: "Berita & Media",
    items: [
      { href: "/dashboard/berita", label: "Berita", icon: "📰" },
      { href: "/dashboard/media", label: "Media (Gambar)", icon: "🖼️" },
    ],
  },
  {
    key: "navigasi",
    label: "Navigasi & Halaman",
    items: (Object.keys(sections) as ContentKey[])
      .filter((k) => sections[k].group === "global")
      .map((k) => ({ href: `/dashboard/konten/${k}`, label: sections[k].label, icon: sections[k].icon })),
  },
];

const top: Item[] = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/pendaftar", label: "Pendaftar PPDB", icon: "🎓" },
];
const sistem: Item[] = [
  { href: "/dashboard/database", label: "Database", icon: "🗄️" },
  { href: "/dashboard/admin", label: "Pengaturan User", icon: "👤" },
  { href: "/dashboard/audit-log", label: "Audit Log", icon: "📜" },
];

const STORE_KEY = "admin-sidebar";
type Saved = { collapsed?: boolean; groups?: Record<string, boolean>; pengaturan?: boolean };
const load = (): Saved => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
};
const save = (v: Saved) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(v));
  } catch {}
};

export function AdminShell({ email, name, children }: { email: string; name: string; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // desktop: mode ikon saja
  const [pgOpen, setPgOpen] = useState(true);
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>({});

  // Ingat pilihan buka/tutup admin (per browser)
  useEffect(() => {
    const s = load();
    /* eslint-disable react-hooks/set-state-in-effect -- sinkron sekali dari localStorage setelah mount */
    if (s.collapsed !== undefined) setCollapsed(s.collapsed);
    if (s.pengaturan !== undefined) setPgOpen(s.pengaturan);
    if (s.groups) setGroupOpen(s.groups);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => save({ collapsed, pengaturan: pgOpen, groups: groupOpen }), [collapsed, pgOpen, groupOpen]);

  // Tutup menu HP saat pindah halaman / tekan Esc
  useEffect(() => {
    if (!mobileOpen) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));
  const isGroupOpen = (key: string, items: Item[]) => groupOpen[key] ?? (key === "beranda" || items.some((i) => isActive(i.href)));
  // Di HP menu selalu lebar penuh; mode ikon hanya untuk desktop
  const mini = collapsed && !mobileOpen;

  const link = (i: Item, sub = false) => {
    const active = isActive(i.href);
    return (
      <li key={i.href}>
        <Link
          href={i.href}
          onClick={() => setMobileOpen(false)}
          aria-current={active ? "page" : undefined}
          title={mini ? i.label : undefined}
          className={`flex items-center gap-3 rounded-xl transition ${mini ? "justify-center p-1.5" : sub ? "px-3 py-2 text-[13px]" : "px-3 py-2.5 text-sm font-semibold"} ${
            active ? "bg-black/25 text-white shadow-inner" : "text-emerald-50/85 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span className={`grid flex-none place-items-center rounded-lg ${sub && !mini ? "h-6 w-6 text-sm" : "h-9 w-9 bg-white text-base shadow-sm"}`} aria-hidden="true">
            {i.icon}
          </span>
          {!mini && <span className="truncate">{i.label}</span>}
          {mini && <span className="sr-only">{i.label}</span>}
        </Link>
      </li>
    );
  };

  const chevron = (open: boolean) => (
    <span className={`ml-auto text-xs transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">▾</span>
  );

  const width = mini ? "5.5rem" : "18rem";

  return (
    // Menutupi seluruh layar (di atas header/footer website) tanpa mengubah komponen FE
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-100 text-slate-800" style={{ "--sb": width } as CSSProperties}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#00482F] via-[#005a3b] to-[#006241] text-white shadow-xl transition-[transform,width] duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: mobileOpen ? "min(18rem, 85vw)" : width }}
        aria-label="Menu admin"
      >
        {/* Bagian atas: diam (tidak ikut ter-scroll) */}
        <div className="flex-none">
          <div className={`flex items-center gap-3 pt-6 pb-4 ${mini ? "justify-center px-2" : "px-6"}`}>
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/15 text-2xl ring-1 ring-white/30" aria-hidden="true">🌱</span>
            {!mini && (
              <div className="min-w-0 leading-tight">
                <p className="text-lg font-bold tracking-tight">Panel Sekolah</p>
                <p className="truncate text-[11px] text-emerald-100/70">SMP Muhammadiyah 1 Jati Agung</p>
              </div>
            )}
            <button type="button" onClick={() => setMobileOpen(false)} className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-lg hover:bg-white/10 lg:hidden" aria-label="Tutup menu">
              ✕
            </button>
          </div>

          <div className={`mb-3 flex items-center gap-3 rounded-xl bg-white/10 ring-1 ring-white/15 ${mini ? "mx-auto h-12 w-12 justify-center" : "mx-4 px-3 py-2.5"}`} title={mini ? name || email : undefined}>
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#F7BC64] font-bold text-[#291800]" aria-hidden="true">
              {(name || email).charAt(0).toUpperCase()}
            </span>
            {!mini && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold" title={name || email}>{name || email}</p>
                <p className="text-[11px] text-emerald-100/70">Admin</p>
              </div>
            )}
          </div>
          {/* Garis batas: isi menu di bawah ini yang ter-scroll */}
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {/* Isi menu: satu-satunya bagian yang bisa di-scroll, scrollbar disembunyikan */}
        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-12px),transparent)]">
          <ul className="space-y-1">{top.map((i) => link(i))}</ul>

          {mini ? (
            // Mode ikon: tampilkan ikon tiap fitur langsung
            <ul className="space-y-1 border-y border-white/10 py-2">{pengaturan.flatMap((g) => g.items).map((i) => link(i))}</ul>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setPgOpen((o) => !o)}
                aria-expanded={pgOpen}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-50/90 transition hover:bg-white/10"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-base shadow-sm" aria-hidden="true">⚙️</span>
                Pengaturan
                {chevron(pgOpen)}
              </button>
              {pgOpen && (
                <div className="mt-1 ml-6 space-y-1 border-l border-white/15 pl-2">
                  {pengaturan.map((g) => {
                    const open = isGroupOpen(g.key, g.items);
                    return (
                      <div key={g.key}>
                        <button
                          type="button"
                          onClick={() => setGroupOpen((s) => ({ ...s, [g.key]: !open }))}
                          aria-expanded={open}
                          className="flex w-full items-center rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wider text-emerald-100/60 uppercase hover:bg-white/5 hover:text-emerald-50"
                        >
                          {g.label}
                          {chevron(open)}
                        </button>
                        {open && <ul className="space-y-0.5 pb-1">{g.items.map((i) => link(i, true))}</ul>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <ul className="space-y-1 pt-1">{sistem.map((i) => link(i))}</ul>
        </nav>

        {/* Bawah: diam */}
        <div className="flex-none space-y-2 border-t border-white/10 px-3 pt-3 pb-5">
          <a href="/" target="_blank" title="Lihat Website" className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs text-emerald-50/80 ring-1 ring-white/20 hover:bg-white/10 ${mini ? "px-0" : "px-3"}`}>
            🌐{!mini && " Lihat Website ↗"}
          </a>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/login" })}
            title="Log Out"
            className={`flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-red-400 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/30 hover:from-red-600 hover:to-red-500 ${mini ? "px-0" : "gap-6 px-4"}`}
          >
            <LogoutIcon />
            {!mini && <span>Log Out</span>}
          </button>
        </div>

        {/* Tombol buka/tutup sidebar (desktop) */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          aria-expanded={!collapsed}
          className="absolute top-1/2 -right-5 hidden h-16 w-5 -translate-y-1/2 place-items-center rounded-r-xl bg-[#F7BC64] text-[#291800] shadow-md transition hover:w-6 hover:bg-[#f5ad42] lg:grid"
        >
          <span className={`text-lg leading-none font-bold transition-transform ${collapsed ? "" : "rotate-180"}`} aria-hidden="true">›</span>
        </button>
      </aside>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}

      <div className="transition-[padding] duration-200 lg:pl-[var(--sb)]">
        {/* Topbar HP & tablet */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-lg" onClick={() => setMobileOpen(true)} aria-label="Buka menu admin" aria-expanded={mobileOpen}>
            ☰
          </button>
          <p className="truncate font-semibold text-emerald-800">Panel Sekolah</p>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}

/** Ikon keluar (pintu + panah), seperti di Swarna Panel */
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}
