import type { Metadata } from "next";
import Link from "next/link";
import { getContent, getPpdbStatus } from "@/lib/content/get";
import { PpdbForm } from "./form";

// Diperbarui langsung saat admin buka/tutup pendaftaran; revalidate = cadangan tiap 60 detik
export const revalidate = 60;

export const metadata: Metadata = { title: "Pendaftaran Siswa Baru PPDB 2026/2027" };

export default async function PpdbPage() {
  // Buka/tutup pendaftaran & teksnya diatur dari panel admin
  const [{ isOpen, deadline }, c, footer] = await Promise.all([getPpdbStatus(), getContent("ppdb"), getContent("footer")]);

  return (
    <>
      <div className="crumbbar">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">🏠 Beranda</Link>
            <span aria-hidden="true">›</span>
            <span className="cur" aria-current="page">{c.breadcrumb}</span>
          </nav>
          <div className="ticker">
            <span className="dot" style={isOpen ? undefined : { background: "#c0392b" }} />{" "}
            {isOpen ? (deadline ? <>{c.tickerBuka} <b>{deadline}</b></> : c.tickerBukaTanpaBatas) : c.tickerTutup}
          </div>
        </div>
      </div>

      <main className="container">
        {isOpen ? (
          <div className="form-layout" id="form">
            <PpdbForm />
          </div>
        ) : (
          <section className="card closed-card" id="form">
            <div className="big" aria-hidden="true">🔒</div>
            <h2>{c.judulTutup}</h2>
            <p>{c.pesanTutup}</p>
            {footer.whatsapp && (
              <a
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                href={`https://wa.me/${footer.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Hubungi Panitia via WhatsApp
              </a>
            )}
          </section>
        )}
      </main>
    </>
  );
}
