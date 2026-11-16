import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin } from "lucide-react";

// Ikon merek dibuat manual (SVG) supaya tidak bergantung versi lucide-react
function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
      <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="ft" id="kontak">
      <div className="container">
        <div className="ft-grid">
          {/* Kolom 1: logo, visi, kontak singkat, akreditasi */}
          <div>
            <div className="ft-brand">
              <Image src="/logoSkula.png" alt="Logo SMP Muhammadiyah 1 Jati Agung" width={52} height={52} />
              <div>
                <b>SMP Muhammadiyah 1 Jati Agung</b>
                <small>Lampung Selatan</small>
              </div>
            </div>
            <p className="ft-visi">
              “Terbentuknya generasi Qurani yang berakhlak mulia, berkemajuan, dan unggul dalam ilmu pengetahuan serta teknologi”
            </p>

            <div className="ft-social">
              <a
                href="https://wa.me/6281272004560"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp +62 812-7200-4560"
                title="WhatsApp: +62 812-7200-4560"
              >
                <IconWhatsApp />
              </a>
              <a
                href="https://www.instagram.com/smpmuh1jatiagung"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @smpmuh1jatiagung"
                title="Instagram: @smpmuh1jatiagung"
              >
                <IconInstagram />
              </a>
              <a
                href="mailto:smpmuhammadiyah1jatiagung@gmail.com"
                aria-label="Email smpmuhammadiyah1jatiagung@gmail.com"
                title="smpmuhammadiyah1jatiagung@gmail.com"
              >
                <Mail size={20} strokeWidth={2} />
              </a>
            </div>

            <p className="ft-meta">
              <b>Terakreditasi C</b> · NPSN: 10800457 · BAN-S/M 2023
            </p>
          </div>

          {/* Kolom 2: tautan cepat */}
          <div>
            <h4>Tautan Cepat</h4>
            <ul className="ft-links">
              <li><Link href="/">Beranda Utama</Link></li>
              <li><Link href="/#program">Visi, Misi &amp; Kurikulum Merdeka</Link></li>
              <li><Link href="/#ekskul">Ekstrakurikuler &amp; Prestasi</Link></li>
            </ul>
            <Link className="ft-cta" href="/ppdb">Daftar PPDB 2026/2027 →</Link>
          </div>

          {/* Kolom 3: informasi kontak */}
          <div>
            <h4>Informasi Kontak</h4>
            <ul className="ft-contact">
              <li>
                <span className="ft-ic"><MapPin size={18} /></span>
                <div>
                  <b>Alamat Sekolah</b>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=M9H2%2BHCR%20Jati%20Agung%20Lampung%20Selatan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Kantor: Gedung SMP Muhammadiyah 1 Jati Agung<br />
                    M9H2+HCR, Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung,
                    Kabupaten Lampung Selatan, Lampung 35365
                  </a>
                </div>
              </li>
              <li>
                <span className="ft-ic"><Clock size={18} /></span>
                <div>
                  <b>Jam Layanan Panitia</b>
                  Senin – Jumat: 08.00 – 14.30 WIB
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="ft-bottom">
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