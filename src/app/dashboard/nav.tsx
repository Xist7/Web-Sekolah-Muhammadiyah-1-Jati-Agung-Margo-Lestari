"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "📊 Ringkasan & Pendaftaran" },
  { href: "/dashboard/konten", label: "✏️ Edit Konten & Foto" },
  { href: "/dashboard/database", label: "🗄️ Database" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-2 px-4" aria-label="Menu admin">
      {items.map((i) => {
        const active = i.href === "/dashboard" ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              active ? "bg-emerald-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
