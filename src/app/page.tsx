import Link from "next/link";
import { EskulPicker } from "@/components/eskul-picker";
import { GuruCarousel } from "@/components/guru-carousel";
import { Reveal } from "@/components/reveal";
import { formatTanggal } from "@/lib/berita/format";
import { getPublishedPosts } from "@/lib/berita/queries";
import { MediaIcon } from "@/components/media-icon";
import { getContent, getPpdbStatus } from "@/lib/content/get";

// Beranda diperbarui otomatis saat admin menerbitkan berita; revalidate = cadangan tiap 5 menit
export const revalidate = 300;

// Ikon pengganti bila berita belum punya gambar sampul
const newsIcon = (category: string) =>
  /prestasi|juara/i.test(category) ? "🏆" : /ppdb|pengumuman/i.test(category) ? "📋" : /kegiatan|agenda/i.test(category) ? "🌿" : "📰";

// Gambar memenuhi kotak .ph (dipakai bila admin mengunggah foto)
const fill = { width: "100%", height: "100%", objectFit: "cover" } as const;

export default async function HomePage() {
  // Isi beranda diambil dari panel admin (Pengaturan → Beranda); kalau belum diedit, pakai isi bawaan
  const [hero, sambutan, guru, fasilitas, prestasi, ekskul, ppdb] = await Promise.all([
    getContent("hero"),
    getContent("sambutan"),
    getContent("guru"),
    getContent("fasilitas"),
    getContent("prestasi"),
    getContent("ekskul"),
    getPpdbStatus(),
  ]);
  const kepala = guru.daftar.find((g) => g.kepalaSekolah);
  const guruLain = guru.daftar.filter((g) => !g.kepalaSekolah);
  const paragrafSambutan = sambutan.isi.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

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
            <span className="dot" /> {ppdb.isOpen ? hero.chipBuka : hero.chipTutup}
          </Link>
          <div className="hero-grid">
            <div>
              {hero.eyebrow && <p className="eyebrow" style={{ marginBottom: 8 }}>{hero.eyebrow}</p>}
              <h1>{hero.judul}</h1>
              {hero.alamat && <p className="addr">{hero.alamat}</p>}
              <div className="hero-ctas">
                <Link className="btn btn-primary" href="/ppdb">{hero.tombolDaftar}</Link>
                <a className="btn btn-soft" href="#profil">{hero.tombolProfil}</a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-photo">
                <div className="ph" role="img" aria-label="Foto lingkungan sekolah" style={hero.foto ? { padding: 0, overflow: "hidden" } : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {hero.foto ? <img src={hero.foto} alt="" style={fill} /> : "🏫"}
                </div>
                <div className="float-pill">
                  <span className="ic">🏫</span>
                  <span><strong>{hero.labelJudul}</strong><small>{hero.labelSub}</small></span>
                </div>
              </div>
            </div>
          </div>
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

      {/* SAMBUTAN */}
      <section className="section" id="program">
        <div className="container">
          <Reveal>
            <div className="principal">
              <figure className="principal-photo">
                <div className="ph" role="img" aria-label="Foto Kepala Sekolah" style={kepala?.foto ? { padding: 0, overflow: "hidden" } : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {kepala?.foto ? <img src={kepala.foto} alt="" style={fill} /> : "👤"}
                </div>
                {kepala && <figcaption><b>{kepala.nama}</b><span>{kepala.mapel}</span></figcaption>}
              </figure>
              <div>
                {sambutan.eyebrow && <p className="eyebrow">{sambutan.eyebrow}</p>}
                {sambutan.kutipan && <blockquote>{sambutan.kutipan}</blockquote>}
                {paragrafSambutan.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <GuruCarousel eyebrow={guru.eyebrow} judul={guru.judul} subjudul={guru.subjudul} daftar={guruLain} />
      </Reveal>

      {/* FASILITAS */}
      <section className="section" id="fasilitas">
        <div className="container">
          <Reveal>
            <div className="section-head center">
              {fasilitas.eyebrow && <p className="eyebrow">{fasilitas.eyebrow}</p>}
              <h2 className="section-title">{fasilitas.judul}</h2>
            </div>
            <div className="grid-2">
              {fasilitas.daftar.map((f, i) => {
                const img = f.media.jenis === "gambar" ? f.media.gambar : "";
                return (
                  <article className="card fac" key={i}>
                    <div className="ph" role="img" aria-label={f.judul} style={img ? { padding: 0, overflow: "hidden" } : undefined}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {img ? <img src={img} alt="" loading="lazy" style={fill} /> : f.media.emoji}
                    </div>
                    <h3>{f.judul}</h3>
                    <p>{f.deskripsi}</p>
                  </article>
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

      {/* EKSKUL */}
      <section className="section" id="ekskul">
        <div className="container">
          <Reveal>
            <div className="section-head">
              {ekskul.eyebrow && <p className="eyebrow">{ekskul.eyebrow}</p>}
              <h2 className="section-title">{ekskul.judul}</h2>
            </div>
            <EskulPicker
              items={ekskul.daftar.map((e) => ({ e: e.media.emoji, img: e.media.jenis === "gambar" ? e.media.gambar : "", name: e.nama, sub: e.keterangan, desc: e.deskripsi }))}
            />
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