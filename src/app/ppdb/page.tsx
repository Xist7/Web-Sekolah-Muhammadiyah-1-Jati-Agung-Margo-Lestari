import type { Metadata } from "next";
import Link from "next/link";
import { PpdbForm } from "./form";

export const metadata: Metadata = { title: "Pendaftaran Siswa Baru PPDB 2026/2027" };

export default function PpdbPage() {
  return (
    <>
      <div className="crumbbar">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">🏠 Beranda</Link>
            <span aria-hidden="true">›</span>
            <span className="cur" aria-current="page">Pendaftaran Siswa Baru (PPDB 2026/2027)</span>
          </nav>
          <div className="ticker"><span className="dot" /> Pendaftaran Gelombang 1 dibuka hingga <b>28 Februari 2027</b></div>
        </div>
      </div>

      <main className="container">
        <div className="form-layout" id="form">
          <PpdbForm />
        </div>
      </main>
    </>
  );
}
