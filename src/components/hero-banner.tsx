import Link from "next/link";

export function HeroBanner() {
  return (
    <section
      className="hero-banner"
      style={{ backgroundImage: "url('/hero.jpeg')" }}
    >
      <div className="hero-banner-overlay" />
      <div className="container hero-banner-content">
        <div className="hero-banner-inner">
          <Link className="hero-banner-badge" href="/ppdb">
            Penerimaan Siswa Baru (PPDB) 2026/2027 Telah Dibuka
          </Link>
          <p className="hero-banner-eyebrow">
            Sekolah Swasta Islam · Zona Nyaman &amp; Menyenangkan
          </p>
          <h1>SMP MUHAMMADIYAH 1 JATI AGUNG</h1>
          <p className="hero-banner-addr">
            Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung
          </p>
          <div className="hero-banner-actions">
            <Link href="/ppdb" className="hero-btn hero-btn-primary">
              Daftar PPDB 2026/2027
            </Link>
            <Link href="/#profil" className="hero-btn hero-btn-ghost">
              🏫 Profil Sekolah
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}