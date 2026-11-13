import Link from "next/link";
import { GuruCarousel } from "@/components/guru-carousel";
import { Reveal } from "@/components/reveal";
import { formatTanggal } from "@/lib/berita/format";
import { getPublishedPosts } from "@/lib/berita/queries";

const stats = [
  { ic: "📅", value: "1993", label: "Sekolah berdiri sejak" },
  { ic: "🎓", value: "58", label: "Jumlah siswa" },
  { ic: "👩‍🏫", value: "11", label: "Tenaga pendidik" },
];

const facilities = [
  { ic: "🏫", alt: "Ruang kelas", title: "Ruang Kelas", desc: "Ruang belajar yang bersih dan nyaman untuk kegiatan belajar sehari-hari." },
  { ic: "🏢", alt: "Kantor", title: "Kantor", desc: "Tempat guru dan staf bekerja, sekaligus melayani orang tua dan tamu yang ingin bertanya atau mengurus keperluan sekolah." },
];

const achievements = [
  { badge: "Emas", title: "OSN IPA & Matematika", desc: "Medali Emas Olimpiade Sains Nasional Tingkat Provinsi Lampung & Finalis Nasional.", by: "Tim Sains Junior 2024" },
  { badge: "Juara 1", title: "National Robotics Olympiad", desc: "Kategori Autonomous Eco-Sorting Robot (Robot Pemilah Sampah Cerdas) di ITB Bandung.", by: "Tim Robotik Sekolah" },
  { badge: "Best Speaker", title: "English Debate", desc: "Penghargaan Pembicara Terbaik & Juara Umum English Parliamentary Debate Junior Championship.", by: "Amanda Kirana (Kelas 8)" },
  { badge: "Juara 2", title: "FLS2N Seni & Musik", desc: "Festival dan Lomba Seni Siswa Nasional cabang Ansambel Musik Campuran Nusantara.", by: "Ansambel Musik Sekolah" },
];

const eskul = [
  { e: "🤖", name: "Robotik & AI", sub: "STEM Terapan" },
  { e: "🎤", name: "English Debate", sub: "Model UN & Speech" },
  { e: "🌱", name: "Eco Hidroponik", sub: "Urban Farming Club" },
  { e: "🥋", name: "Taekwondo & Silat", sub: "Bela Diri Prestasi" },
  { e: "🏀", name: "Basket & Futsal", sub: "Lapangan Standar FIBA" },
  { e: "🎶", name: "Seni & Musik", sub: "Ensembel & Ilustrasi" },
];

// Beranda diperbarui otomatis saat admin menerbitkan berita; revalidate = cadangan tiap 5 menit
export const revalidate = 300;

// Ikon pengganti bila berita belum punya gambar sampul
const newsIcon = (category: string) =>
  /prestasi|juara/i.test(category) ? "🏆" : /ppdb|pengumuman/i.test(category) ? "📋" : /kegiatan|agenda/i.test(category) ? "🌿" : "📰";

export default async function HomePage() {
  // Berita diambil dari panel admin (Pengaturan → Berita): 3 terbaru yang sudah terbit
  const news = (await getPublishedPosts(3)).map((p) => ({
    slug: p.slug,
    cover: p.coverUrl,
    ic: newsIcon(p.category),
    date: p.publishedAt?.toISOString() ?? "",
    dateLabel: formatTanggal(p.publishedAt),
    tag: p.category,
    title: p.title,
    desc: p.subtitle,
  }));

  return (
    <main id="beranda">
      {/* HERO (tidak dibungkus, langsung tampil) */}
      <section className="hero">
        <div className="container">
          <Link className="chip" href="/ppdb">
            <span className="dot" /> Penerimaan Siswa Baru (PPDB) 2026/2027 Telah Dibuka
          </Link>
          <div className="hero-grid">
            <div>
              <p className="eyebrow" style={{ marginBottom: 8 }}>Sekolah Swasta Islam · Zona Nyaman &amp; Menyenangkan</p>
              <h1>SMP MUHAMMADIYAH 1 JATI AGUNG</h1>
              <p className="addr">Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung</p>
              <div className="hero-ctas">
                <Link className="btn btn-primary" href="/ppdb">Daftar PPDB 2026/2027 →</Link>
                <a className="btn btn-soft" href="#profil">🏫 Profil Sekolah</a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-photo">
                <div className="ph" role="img" aria-label="Foto lingkungan sekolah">🏫</div>
                <div className="float-pill">
                  <span className="ic">🏫</span>
                  <span><strong>Sekolah Swasta Islam</strong><small>Zona nyaman &amp; menyenangkan</small></span>
                </div>
              </div>
            </div>
          </div>
          <div className="stats" id="profil">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="ic">{s.ic}</div>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAMBUTAN */}
      <section className="section" id="program">
        <div className="container">
          <Reveal>
            <div className="principal">
              <figure className="principal-photo">
                <div className="ph" role="img" aria-label="Foto Kepala Sekolah">👤</div>
                <figcaption><b>Julianto</b><span>Kepala Sekolah SMP Muhammadiyah 1 Jati Agung</span></figcaption>
              </figure>
              <div>
                <p className="eyebrow">Visi dan Misi Sekolah</p>
                <blockquote>“Setiap anak adalah bibit unggul yang bertumbuh optimal di tanah yang penuh kasih dan keteladanan.”</blockquote>
                <p>
                  Selamat datang di SMP Muhammadiyah 1 Jati Agung. Memasuki usia remaja awal adalah fase transisi krusial
                  di mana rasa ingin tahu, kecerdasan moral, dan kesadaran sosial mulai berakar kuat. Kami meyakini bahwa
                  pendidikan sejati bukan semata tentang tumpukan nilai kognitif, melainkan penempaan integritas budi
                  pekerti yang selaras dengan kecintaan terhadap sesama dan alam semesta.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <GuruCarousel />
      </Reveal>

      {/* FASILITAS */}
      <section className="section" id="fasilitas">
        <div className="container">
          <Reveal>
            <div className="section-head center">
              <p className="eyebrow">Sarana &amp; Prasarana</p>
              <h2 className="section-title">Fasilitas SMP Muhammadiyah 1 Jati Agung</h2>
            </div>
            <div className="grid-2">
              {facilities.map((f) => (
                <article className="card fac" key={f.title}>
                  <div className="ph" role="img" aria-label={f.alt}></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRESTASI */}
      <section className="section section-alt" id="prestasi">
        <div className="container">
          <Reveal>
            <div className="achv-panel">
              <div className="achv-head">
                <div>
                  <p className="eyebrow">Jejak Prestasi Siswa</p>
                  <h2 className="section-title">Kilau Kejuaraan Nasional &amp; Internasional</h2>
                </div>
                <span className="chip">Tahun Ajaran 2026/2027</span>
              </div>
              <div className="achv-grid">
                {achievements.map((a) => (
                  <article className="achv" key={a.title}>
                    <div>
                      <div className="achv-top"><span className="medal">🏅</span><span className="badge">{a.badge}</span></div>
                      <h3>{a.title}</h3>
                      <p>{a.desc}</p>
                    </div>
                    <small>Oleh: {a.by}</small>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EKSKUL */}
      <section className="section" id="ekskul">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Ekstrakurikuler</p>
              <h2 className="section-title">Ekstrakurikuler Pilihan &amp; Bakat Minat</h2>
            </div>
            <div className="eskul-panel">
              <div className="eskul-chips">
                {eskul.map((e) => (
                  <div className="eskul-chip" key={e.name}>
                    <div className="e">{e.e}</div>
                    <b>{e.name}</b>
                    <span>{e.sub}</span>
                  </div>
                ))}
              </div>
              <div className="grid-2">
                <article className="card fac">
                  <h3>🤖 Robotik &amp; AI</h3>
                  <p>Mengembangkan kemampuan STEM melalui proyek robotika dan IoT yang terstruktur.</p>
                </article>
                <article className="card fac">
                  <h3>🌱 Eco Hidroponik</h3>
                  <p>Praktik hidroponik dan konservasi tanaman untuk memupuk rasa hormat pada alam.</p>
                </article>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BERITA */}
      <section className="section section-alt" id="berita">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Kabar Sekolah</p>
              <h2 className="section-title">Berita &amp; Agenda Kegiatan Terkini</h2>
            </div>
            <div className="news-grid">
              {news.map((n) => (
                <article className="card news" key={n.slug}>
                  <div className="ph" role="img" aria-label={n.title} style={n.cover ? { padding: 0, overflow: "hidden" } : undefined}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {n.cover ? <img src={n.cover} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : n.ic}
                  </div>
                  <div className="news-body">
                    <div className="news-meta"><time dateTime={n.date}>{n.dateLabel}</time>{n.tag && <>•<b>{n.tag}</b></>}</div>
                    <h3>{n.title}</h3>
                    <p>{n.desc}</p>
                    <Link className="more" href={`/berita/${n.slug}`}>Baca Selengkapnya →</Link>
                  </div>
                </article>
              ))}
            </div>
            {news.length === 0 && <p style={{ color: "var(--muted-2)" }}>Belum ada berita yang diterbitkan.</p>}
            {news.length > 0 && (
              <p style={{ marginTop: 20, textAlign: "center" }}>
                <Link className="btn btn-soft" href="/berita">Lihat Semua Berita →</Link>
              </p>
            )}
          </Reveal>
        </div>
      </section>
    </main>
  );
}