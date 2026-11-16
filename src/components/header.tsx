"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Urutan menu disamakan dengan urutan section di beranda (supaya highlight saat scroll pas)
const nav = [
  { href: "/", label: "Beranda" },
  { href: "/#program", label: "Profil" },
  { href: "/#fasilitas", label: "Fasilitas" },
  { href: "/#prestasi", label: "Prestasi" },
  { href: "/#ekskul", label: "Ekskul" },
  { href: "/berita", label: "Berita" },
  { href: "/#kontak", label: "Kontak" },
];
const sectionIds = nav.filter((n) => n.href.startsWith("/#")).map((n) => n.href.slice(2));
const HEADER_OFFSET = 120; // tinggi header (80px) + sedikit ruang

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Menu yang disorot di beranda mengikuti section yang sedang terlihat (scroll / klik)
  const [active, setActive] = useState("/");

  useEffect(() => {
    if (pathname !== "/") return;
    const update = () => {
      let current = "/";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET) current = `/#${id}`;
      }
      // Footer (#kontak) pendek: anggap aktif saat sudah mentok bawah
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = `/#${sectionIds.at(-1)}`;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("hashchange", update);
    };
  }, [pathname]);

  const isCurrent = (href: string) => (pathname === "/" ? active === href : href === pathname);

  return (
    <header className="site-header">
      <div className="container">
        <Link className="brand" href="/" aria-label="SMP Muhammadiyah 1 Jati Agung — beranda">
          <Image
            className="brand-logo-img"
            src="/logoSkula.png"
            alt="Logo SMP Muhammadiyah 1 Jati Agung"
            width={48}
            height={48}
            priority
          />
          <div>
            <b>SMP Muhammadiyah 1 Jati Agung</b>
            <small>Lampung Selatan</small>
          </div>
        </Link>
        <nav className={`main-nav${open ? " open" : ""}`} id="nav" aria-label="Navigasi utama">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isCurrent(n.href) ? "page" : undefined}
              onClick={() => {
                setOpen(false);
                if (pathname === "/") setActive(n.href);
              }}
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