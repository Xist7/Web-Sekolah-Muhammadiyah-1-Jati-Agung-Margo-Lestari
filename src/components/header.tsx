"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Beranda" },
  { href: "/#program", label: "Profil & Program" },
  { href: "/#fasilitas", label: "Fasilitas" },
  { href: "/ppdb", label: "Pendaftaran Siswa Baru" },
  { href: "/#kontak", label: "Kontak & Bantuan" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container">
        <Link className="brand" href="/" aria-label="SMP Muhammadiyah 1 Jati Agung — beranda">
          <span className="brand-logo" aria-hidden="true">🌱</span>
          <span>
            <span className="brand-name">SMP MUHAMMADIYAH 1<br />JATI AGUNG</span>
            <br />
            <span className="brand-sub">Portal Resmi &amp; PPDB</span>
          </span>
        </Link>
        <nav className={`main-nav${open ? " open" : ""}`} id="nav" aria-label="Navigasi utama">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={n.href === pathname ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="btn btn-primary btn-sm" href={pathname === "/ppdb" ? "#form" : "/ppdb"}>
            Daftar Sekarang
          </Link>
          <button
            className="menu-toggle"
            aria-label="Buka menu"
            aria-expanded={open}
            aria-controls="nav"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
