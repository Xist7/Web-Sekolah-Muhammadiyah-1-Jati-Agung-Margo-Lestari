import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer" id="kontak">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="brand-logo" aria-hidden="true">🌱</span>
              <b style={{ color: "var(--primary)" }}>SMP MUHAMMADIYAH 1 JATI AGUNG</b>
            </div>
            <p><b>Terakreditasi A+ (Unggul)</b></p>
            <p>
              Membina generasi cendekia berakhlak mulia, berwawasan lingkungan lestari, dan berdaya saing global
              melalui ekosistem pendidikan holistik dan bersahaja.
            </p>
            <p style={{ marginTop: 8, fontSize: 12 }}>NPSN: 20108921 • BAN-S/M 2023</p>
          </div>
          <div>
            <h4>Profil &amp; Navigasi</h4>
            <ul>
              <li><Link href="/">Beranda Utama</Link></li>
              <li><Link href="/#program">Visi, Misi &amp; Kurikulum Merdeka</Link></li>
              <li><Link href="/#ekskul">Ekstrakurikuler &amp; Prestasi</Link></li>
              <li><Link href="/ppdb">Jalur Zonasi &amp; Prestasi PPDB</Link></li>
              <li><Link href="/ppdb">Biaya Pendidikan &amp; Beasiswa</Link></li>
            </ul>
          </div>
          <div>
            <h4>Layanan PPDB</h4>
            <p>
              <b>Jam Layanan Panitia:</b><br />Senin – Jumat: 08.00 – 15.30 WIB<br />Sabtu: 08.30 – 12.00 WIB
            </p>
            <p style={{ marginTop: 10 }}>
              <b>Alamat Sekolah:</b><br />Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung, Kab. Lampung Selatan, Lampung
            </p>
          </div>
          <div>
            <h4>Kanal Resmi</h4>
            <p>Hubungi saluran konsultasi pendaftaran daring:</p>
            <ul style={{ marginTop: 8 }}>
              <li><a href="https://wa.me/6281200000000" target="_blank" rel="noopener noreferrer">WhatsApp Helpdesk</a></li>
              <li><a href="mailto:ppdb@smpmuh1jatiagung.sch.id">ppdb@smpmuh1jatiagung.sch.id</a></li>
              <li>@smpmuh1jatiagung</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SMP Muhammadiyah 1 Jati Agung. Seluruh hak cipta dilindungi undang-undang.</span>
          <nav aria-label="Tautan hukum">
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Ketentuan PPDB</a>
            <a href="#">Integritas Data Siswa</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
