import Link from "next/link";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Eye,
  GraduationCap,
  Leaf,
  Medal,
  Newspaper,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { GuruCarousel } from "@/components/guru-carousel";
import { Reveal } from "@/components/reveal";
import { HeroBanner } from "@/components/hero-banner";
import { EkskulSlider } from "@/components/ekskul-slider";
import { formatTanggal } from "@/lib/berita/format";
import { getPublishedPosts } from "@/lib/berita/queries";

const stats = [
  { Icon: CalendarDays, value: "1993", label: "Tahun berdiri" },
  { Icon: GraduationCap, value: "58", label: "Jumlah siswa" },
  { Icon: Users, value: "11", label: "Tenaga pendidik" },
];

const visi =
  "“Terbentuknya generasi Qurani yang berakhlak mulia, berkemajuan, dan unggul dalam ilmu pengetahuan serta teknologi”";
const misi = [
  "Menanamkan nilai-nilai Al-Qur’an dan As-Sunnah sebagai dasar pembentukan pribadi muslim yang beriman, bertakwa, dan berakhlak mulia.",
  "Menyelenggarakan pendidikan yang mengintegrasikan iman, ilmu, dan amal dalam semangat Islam Berkemajuan.",
  "Mengembangkan potensi peserta didik secara optimal, baik akademik maupun non-akademik, berbasis sains, teknologi, dan kreativitas.",
  "Membentuk karakter siswa yang disiplin, mandiri, bertanggung jawab, dan peduli terhadap sesama serta lingkungan.",
  "Menciptakan lingkungan sekolah yang islami, inklusif, dan berwawasan kebangsaan.",
  "Menumbuhkan semangat tajdid (pembaruan), berpikir kritis, dan adaptif terhadap perkembangan zaman.",
  "Memperkuat kemitraan antara sekolah, orang tua, dan masyarakat dalam mendukung pendidikan yang holistik.",
];

// Foto ada di folder public/ (ruangkelas.jpg dan kantor.jpg)
const facilities = [
  { photo: "/ruangkelas.jpeg", alt: "Foto ruang kelas", title: "Ruang Kelas", desc: "Ruang belajar yang bersih, tertata rapi, dan nyaman untuk kegiatan belajar sehari-hari. Suasana kelas yang tenang dan kondusif membantu siswa lebih fokus menerima pelajaran, sekaligus mendukung kegiatan diskusi dan interaksi yang hangat antara guru dan siswa." },
  { photo: "/kantor.jpeg", alt: "Foto kantor", title: "Kantor", desc: "Tempat guru dan staf bekerja, sekaligus melayani orang tua dan tamu yang ingin bertanya atau mengurus keperluan sekolah." },
];

const achievements = [
  { badge: "Emas", title: "OSN IPA & Matematika", desc: "Medali Emas Olimpiade Sains Nasional Tingkat Provinsi Lampung & Finalis Nasional.", by: "Tim Sains Junior 2024" },
  { badge: "Juara 1", title: "National Robotics Olympiad", desc: "Kategori Autonomous Eco-Sorting Robot (Robot Pemilah Sampah Cerdas) di ITB Bandung.", by: "Tim Robotik Sekolah" },
  { badge: "Best Speaker", title: "English Debate", desc: "Penghargaan Pembicara Terbaik & Juara Umum English Parliamentary Debate Junior Championship.", by: "Amanda Kirana (Kelas 8)" },
  { badge: "Juara 2", title: "FLS2N Seni & Musik", desc: "Festival dan Lomba Seni Siswa Nasional cabang Ansambel Musik Campuran Nusantara.", by: "Ansambel Musik Sekolah" },
];

// Beranda diperbarui otomatis saat admin menerbitkan berita; revalidate = cadangan tiap 5 menit
export const revalidate = 300;

// Ikon pengganti bila berita belum punya gambar sampul
const newsIcon = (category: string) =>
  /prestasi|juara/i.test(category) ? Trophy : /ppdb|pengumuman/i.test(category) ? ClipboardList : /kegiatan|agenda/i.test(category) ? Leaf : Newspaper;

export default async function HomePage() {
  // Berita diambil dari panel admin (Pengaturan → Berita): 3 terbaru yang sudah terbit
  const news = (await getPublishedPosts(3)).map((p) => ({
    slug: p.slug,
    cover: p.coverUrl,
    Icon: newsIcon(p.category),
    date: p.publishedAt?.toISOString() ?? "",
    dateLabel: formatTanggal(p.publishedAt),
    tag: p.category,
    title: p.title,
    desc: p.subtitle,
  }));

  return (
    <main id="beranda">
      {/* HERO BARU */}
      <HeroBanner />

      {/* STATISTIK */}
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <div className="stats" id="profil">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="ic"><s.Icon size={22} strokeWidth={2} /></div>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISI & MISI: foto sekolah 4:3, penjabaran di kiri (id program dipakai menu header) */}
      <section className="section" id="program">
        <div className="container">
          <Reveal>
            <div className="vm-grid">
              <div
                className="vm-photo"
                role="img"
                aria-label="Foto lingkungan SMP Muhammadiyah 1 Jati Agung"
                style={{ backgroundImage: "url('/sekolah.jpeg')" }}
              />
              <div>
                <p className="eyebrow">Arah &amp; Tujuan Sekolah</p>
                <h2 className="section-title">Visi &amp; Misi</h2>

                <div className="vm-block">
                  <h3><Eye size={20} /> Visi</h3>
                  <p>{visi}</p>
                </div>

                <div className="vm-block">
                  <h3><Target size={20} /> Misi</h3>
                  <ul className="vm-list">
                    {misi.map((m) => (
                      <li key={m}>
                        <Check size={18} strokeWidth={2.5} />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SAMBUTAN KEPALA SEKOLAH: teks di kiri, foto kepsek 3:4 di kanan (identitas di dalam foto) */}
      <section className="section" id="sambutan">
        <div className="container">
          <Reveal>
            <div className="sambutan-grid">
              <div className="sambutan-text">
                <p className="eyebrow">Sambutan Kepala Sekolah</p>
                <blockquote>“Setiap anak adalah bibit unggul yang bertumbuh optimal di tanah yang penuh kasih dan keteladanan.”</blockquote>
                <p>
                  Selamat datang di SMP Muhammadiyah 1 Jati Agung. Memasuki usia remaja awal adalah fase transisi krusial
                  di mana rasa ingin tahu, kecerdasan moral, dan kesadaran sosial mulai berakar kuat. Kami meyakini bahwa
                  pendidikan sejati bukan semata tentang tumpukan nilai kognitif, melainkan penempaan integritas budi
                  pekerti yang selaras dengan kecintaan terhadap sesama dan alam semesta.
                </p>
              </div>
              <figure
                className="sambutan-photo"
                style={{ backgroundImage: "url('/kepsek.jpeg')" }}
              >
                <figcaption>
                  <b>Julianto</b>
                  <span>Kepala Sekolah SMP Muhammadiyah 1 Jati Agung</span>
                </figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      <GuruCarousel />

      {/* FASILITAS: zigzag, baris 1 foto kiri + keterangan kanan, baris 2 sebaliknya */}
      <section className="section" id="fasilitas">
        <div className="container">
          <Reveal>
            <div className="section-head center">
              <p className="eyebrow">Sarana &amp; Prasarana</p>
              <h2 className="section-title">Fasilitas SMP Muhammadiyah 1 Jati Agung</h2>
            </div>
            <div className="fac-list">
              {facilities.map((f) => (
                <div className="fac-row" key={f.title}>
                  <div
                    className="fac-photo"
                    role="img"
                    aria-label={f.alt}
                    style={{ backgroundImage: `url('${f.photo}')` }}
                  />
                  <div className="fac-text">
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
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
                      <div className="achv-top"><span className="medal"><Medal size={22} strokeWidth={2} /></span><span className="badge">{a.badge}</span></div>
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

      {/* EKSKUL: slider (Pramuka, Silat, Ekskul Lainnya) */}
      <section className="section" id="ekskul">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Ekstrakurikuler</p>
              <h2 className="section-title">Ekstrakurikuler Pilihan &amp; Bakat Minat</h2>
            </div>
            <EkskulSlider />
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
                    {n.cover ? <img src={n.cover} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <n.Icon size={36} strokeWidth={1.5} />}
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