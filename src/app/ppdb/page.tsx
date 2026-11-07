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

      <section className="reg-hero">
        <div className="container">
          <div className="reg-banner">
            <div className="chips">
              <span className="chip chip-dark">🎓 Tahun Ajaran 2026/2027</span>
              <span className="chip chip-sand">✨ Bebas Tes Akademik Menegangkan</span>
            </div>
            <h1>Bergabung Menjadi Generasi Unggul &amp; Berkarakter</h1>
            <p className="lead">
              Mendidik generasi muda beradab mulia, tangkas dalam teknologi digital, serta memiliki empati mendalam
              terhadap kelestarian alam nusantara. Asesmen holistik berbasis observasi bakat dan pemetaan minat.
            </p>
            <div className="quota" aria-label="Keterisian kuota">
              <div className="top"><span>👥 Keterisian Kuota Gelombang 1:</span><span><em>42</em> dari 120 Kursi Terisi (35%)</span></div>
              <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={120} aria-valuenow={42}><i /></div>
              <div className="bottom"><span>Tersisa 78 Kursi Tersedia</span><b>Tenggat Waktu: 28 Feb 2027</b></div>
            </div>
          </div>
        </div>
      </section>

      <main className="container">
        <div className="form-layout" id="form">
          <PpdbForm />
        </div>
      </main>
    </>
  );
}
