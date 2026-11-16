import Link from "next/link";
import { Check, ClipboardList, Eye, Leaf, Newspaper, Target, Trophy } from "lucide-react";
import { GuruCarousel } from "@/components/guru-carousel";
import { Reveal } from "@/components/reveal";
import { HeroBanner } from "@/components/hero-banner";
import { EkskulSlider } from "@/components/ekskul-slider";
import { MediaIcon } from "@/components/media-icon";
import { formatTanggal } from "@/lib/berita/format";
import { getPublishedPosts } from "@/lib/berita/queries";
import { getContent, getPpdbStatus } from "@/lib/content/get";

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

// Beranda diperbarui otomatis saat admin menerbitkan berita; revalidate = cadangan tiap 5 menit
export const revalidate = 300;

// Ikon pengganti bila berita belum punya gambar sampul
const newsIcon = (category: string) =>
  /prestasi|juara/i.test(category) ? Trophy : /ppdb|pengumuman/i.test(category) ? ClipboardList : /kegiatan|agenda/i.test(category) ? Leaf : Newspaper;

export default async function HomePage() {
  // Isi beranda diambil dari panel admin (Pengaturan → Beranda); kalau belum diedit, pakai isi bawaan
  const [hero, sambutan, guru, fasilitas, prestasi, ppdb] = await Promise.all([
    getContent("hero"),
    getContent("sambutan"),
    getContent("guru"),
    getContent("fasilitas"),
    getContent("prestasi"),
    getPpdbStatus(),
  ]);
  const kepala = guru.daftar.find((g) => g.kepalaSekolah);
  const guruLain = guru.daftar.filter((g) => !g.kepalaSekolah);
  const paragrafSambutan = sambutan.isi.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

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

      {/* STATISTIK (dari admin) */}
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <Link className="chip" href="/ppdb">
            <span className="dot" /> {ppdb.isOpen ? hero.chipBuka : hero.chipTutup}
          </Link>
          <div className="stats" id="profil">
            {hero.statistik.map((s, i) => (
              <div className="stat" key={i}>
                <div className="ic"><MediaIcon m={s.ikon} /></div>
                <b>{s.angka}</b>
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

      {/* SAMBUTAN KEPALA SEKOLAH: teks dari admin, tampilan sambutan-grid */}
      <section className="section" id="sambutan">
        <div className="container">
          <Reveal>
            <div className="sambutan-grid">
              <div className="sambutan-text">
                {sambutan.eyebrow && <p className="eyebrow">{sambutan.eyebrow}</p>}
                {sambutan.kutipan && <blockquote>{sambutan.kutipan}</blockquote>}
                {paragrafSambutan.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <figure
                className="sambutan-photo"
                style={{ backgroundImage: `url('${kepala?.foto || "/kepsek.jpeg"}')` }}
              >
                <figcaption>
                  <b>{kepala?.nama ?? "Julianto, M.Pd"}</b>
                  <span>{kepala?.mapel || "Kepala Sekolah SMP Muhammadiyah 1 Jati Agung"}</span>
                </figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      <GuruCarousel eyebrow={guru.eyebrow} judul={guru.judul} subjudul={guru.subjudul} daftar={guruLain} />

      {/* FASILITAS: zigzag, baris 1 foto kiri + keterangan kanan, baris 2 sebaliknya */}
      <section className="section" id="fasilitas">
        <div className="container">
          <Reveal>
            <div className="section-head center">
              {fasilitas.eyebrow && <p className="eyebrow">{fasilitas.eyebrow}</p>}
              <h2 className="section-title">{fasilitas.judul}</h2>
            </div>
            <div className="fac-list">
              {fasilitas.daftar.map((f, i) => {
                const img = f.media.jenis === "gambar" ? f.media.gambar : "";
                return (
                  <div className="fac-row" key={i}>
                    <div
                      className="fac-photo"
                      role="img"
                      aria-label={f.judul}
                      style={img ? { backgroundImage: `url('${img}')` } : undefined}
                    >
                      {!img && f.media.emoji}
                    </div>
                    <div className="fac-text">
                      <h3>{f.judul}</h3>
                      <p>{f.deskripsi}</p>
                    </div>
                  </div>
                );
              })}
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
                  {prestasi.eyebrow && <p className="eyebrow">{prestasi.eyebrow}</p>}
                  <h2 className="section-title">{prestasi.judul}</h2>
                </div>
                {prestasi.chip && <span className="chip">{prestasi.chip}</span>}
              </div>
              <div className="achv-grid">
                {prestasi.daftar.map((a, i) => (
                  <article className="achv" key={i}>
                    <div>
                      <div className="achv-top"><span className="medal"><MediaIcon m={a.media} /></span>{a.lencana && <span className="badge">{a.lencana}</span>}</div>
                      <h3>{a.judul}</h3>
                      <p>{a.deskripsi}</p>
                    </div>
                    {a.oleh && <small>Oleh: {a.oleh}</small>}
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