/**
 * Isi bawaan semua teks & foto halaman publik. Admin mengubahnya lewat /dashboard/konten,
 * hasilnya disimpan di tabel SiteContent (satu baris per bagian) dan digabung dengan nilai di sini.
 *
 * Aturan editor otomatis (lihat content-editor.tsx):
 *  - key `foto` / `logo` / berakhiran `Foto`  → kolom unggah gambar (kosong = pakai ikon emoji)
 *  - key `tanggal`                             → input tanggal (YYYY-MM-DD)
 *  - angka                                     → input angka
 *  - array                                     → daftar poin yang bisa ditambah / dihapus / diurutkan
 */

export const headerDefaults = {
  logo: "",
  logoEmoji: "🌱",
  namaBaris1: "SMP MUHAMMADIYAH 1",
  namaBaris2: "JATI AGUNG",
  subjudul: "Portal Resmi & PPDB",
  tombolDaftar: "Daftar Sekarang",
  menu: [
    { label: "Beranda", link: "/" },
    { label: "Profil & Program", link: "/#program" },
    { label: "Fasilitas", link: "/#fasilitas" },
    { label: "Pendaftaran Siswa Baru", link: "/ppdb" },
    { label: "Kontak & Bantuan", link: "/#kontak" },
  ],
};

export const homeDefaults = {
  chipPpdb: "Penerimaan Siswa Baru (PPDB) 2026/2027 Telah Dibuka",
  chipPpdbTutup: "Pendaftaran Siswa Baru Saat Ini Ditutup",
  eyebrowHero: "Sekolah Swasta Islam · Zona Nyaman & Menyenangkan",
  judulHero: "SMP MUHAMMADIYAH 1 JATI AGUNG",
  alamat: "Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung",
  tombolDaftar: "Daftar PPDB 2026/2027 →",
  tombolProfil: "🏫 Profil Sekolah",
  heroFoto: "",
  heroLabelJudul: "Sekolah Swasta Islam",
  heroLabelSub: "Zona nyaman & menyenangkan",
  statistik: [
    { ikon: "📅", angka: "1993", label: "Sekolah berdiri sejak" },
    { ikon: "🎓", angka: "58", label: "Jumlah siswa" },
    { ikon: "👩‍🏫", angka: "11", label: "Tenaga pendidik" },
  ],
  kepalaSekolahFoto: "",
  kepalaSekolahNama: "Julianto",
  kepalaSekolahJabatan: "Kepala Sekolah SMP Muhammadiyah 1 Jati Agung",
  sambutanEyebrow: "Visi dan Misi Sekolah",
  sambutanKutipan:
    "“Setiap anak adalah bibit unggul yang bertumbuh optimal di tanah yang penuh kasih dan keteladanan.”",
  sambutanIsi:
    "Selamat datang di SMP Muhammadiyah 1 Jati Agung. Memasuki usia remaja awal adalah fase transisi krusial di mana rasa ingin tahu, kecerdasan moral, dan kesadaran sosial mulai berakar kuat. Kami meyakini bahwa pendidikan sejati bukan semata tentang tumpukan nilai kognitif, melainkan penempaan integritas budi pekerti yang selaras dengan kecintaan terhadap sesama dan alam semesta.",
  fasilitasEyebrow: "Sarana & Prasarana",
  fasilitasJudul: "Fasilitas SMP Muhammadiyah 1 Jati Agung",
  fasilitas: [
    { ikon: "🖥️", foto: "", judul: "Ruang Kelas Multimedia", deskripsi: "Papan interaktif 75 inci dan konfigurasi meja modular untuk kerja kelompok dinamis." },
    { ikon: "🔬", foto: "", judul: "Laboratorium Sains", deskripsi: "Peralatan eksperimen biologi, kimia ramah lingkungan, kit IoT Arduino, serta printer 3D." },
    { ikon: "📚", foto: "", judul: "Perpustakaan & Reading Lounge", deskripsi: "Akses ribuan e-book, jurnal sains remaja, dan sudut baca santai berkarpet hening." },
    { ikon: "🏀", foto: "", judul: "Gelanggang Olahraga", deskripsi: "Lapangan basket indoor berstandar kompetisi dan area tenis meja untuk aktivitas fisik." },
  ],
  prestasiEyebrow: "Jejak Prestasi Siswa",
  prestasiJudul: "Kilau Kejuaraan Nasional & Internasional",
  prestasiChip: "Tahun Ajaran 2026/2027",
  prestasi: [
    { lencana: "Emas", judul: "OSN IPA & Matematika", deskripsi: "Medali Emas Olimpiade Sains Nasional Tingkat Provinsi Lampung & Finalis Nasional.", oleh: "Tim Sains Junior 2024" },
    { lencana: "Juara 1", judul: "National Robotics Olympiad", deskripsi: "Kategori Autonomous Eco-Sorting Robot (Robot Pemilah Sampah Cerdas) di ITB Bandung.", oleh: "Tim Robotik Sekolah" },
    { lencana: "Best Speaker", judul: "English Debate", deskripsi: "Penghargaan Pembicara Terbaik & Juara Umum English Parliamentary Debate Junior Championship.", oleh: "Amanda Kirana (Kelas 8)" },
    { lencana: "Juara 2", judul: "FLS2N Seni & Musik", deskripsi: "Festival dan Lomba Seni Siswa Nasional cabang Ansambel Musik Campuran Nusantara.", oleh: "Ansambel Musik Sekolah" },
  ],
  ekskulEyebrow: "Ekstrakurikuler",
  ekskulJudul: "Ekstrakurikuler Pilihan & Bakat Minat",
  ekskul: [
    { ikon: "🤖", nama: "Robotik & AI", keterangan: "STEM Terapan" },
    { ikon: "🎤", nama: "English Debate", keterangan: "Model UN & Speech" },
    { ikon: "🌱", nama: "Eco Hidroponik", keterangan: "Urban Farming Club" },
    { ikon: "🥋", nama: "Taekwondo & Silat", keterangan: "Bela Diri Prestasi" },
    { ikon: "🏀", nama: "Basket & Futsal", keterangan: "Lapangan Standar FIBA" },
    { ikon: "🎶", nama: "Seni & Musik", keterangan: "Ensembel & Ilustrasi" },
  ],
  ekskulSorotan: [
    { judul: "🤖 Robotik & AI", deskripsi: "Mengembangkan kemampuan STEM melalui proyek robotika dan IoT yang terstruktur." },
    { judul: "🌱 Eco Hidroponik", deskripsi: "Praktik hidroponik dan konservasi tanaman untuk memupuk rasa hormat pada alam." },
  ],
  beritaEyebrow: "Kabar Sekolah",
  beritaJudul: "Berita & Agenda Kegiatan Terkini",
  berita: [
    { ikon: "🔭", foto: "", tanggal: "2026-02-24", tag: "Prestasi", judul: "Pameran Inovasi Sains & Gelar Karya P5 Siswa 2026 Memukau Pengunjung", deskripsi: "Sebanyak 48 proyek sains ramah lingkungan buatan siswa kelas 7 dan 8 berhasil dipamerkan di hadapan orang tua dan masyarakat sekitar.", link: "#berita" },
    { ikon: "🌿", foto: "", tanggal: "2026-02-18", tag: "Kegiatan", judul: "Kunjungan Edukasi Duta Lingkungan: Bersama Melestarikan Pesisir", deskripsi: "Anggota Eco-Club menanam 500 bibit mangrove dan melakukan riset kualitas ekosistem pesisir.", link: "#berita" },
    { ikon: "📋", foto: "", tanggal: "2026-02-10", tag: "Pengumuman PPDB", judul: "Jadwal & Alur Seleksi PPDB Gelombang I Tahun Pelajaran 2026/2027", deskripsi: "Simak timeline penting pembukaan pendaftaran jalur reguler, prestasi, dan beasiswa peduli bumi.", link: "/ppdb" },
  ],
};

export const ppdbDefaults = {
  breadcrumb: "Pendaftaran Siswa Baru (PPDB 2026/2027)",
  tickerBuka: "Pendaftaran Gelombang 1 dibuka hingga",
  tenggat: "28 Februari 2027",
  tickerTutup: "Pendaftaran saat ini ditutup",
  judulTutup: "Pendaftaran Sedang Ditutup",
  pesanTutup:
    "Terima kasih atas minat Anda. Pendaftaran siswa baru saat ini belum dibuka / sudah ditutup. Pantau informasi terbaru atau hubungi panitia melalui WhatsApp.",
  pekerjaanPilihan: ["Karyawan Swasta / BUMN", "PNS / TNI / Polri", "Wiraswasta", "Petani / Pekebun", "Guru / Dosen", "Lainnya"],
  sumberInfoPilihan: ["Sosial Media", "Keluarga", "Website", "Saudara", "Teman", "Guru", "Tetangga"],
};

export const footerDefaults = {
  akreditasi: "Terakreditasi A+ (Unggul)",
  deskripsi:
    "Membina generasi cendekia berakhlak mulia, berwawasan lingkungan lestari, dan berdaya saing global melalui ekosistem pendidikan holistik dan bersahaja.",
  npsn: "NPSN: 20108921 • BAN-S/M 2023",
  navJudul: "Profil & Navigasi",
  navLinks: [
    { label: "Beranda Utama", link: "/" },
    { label: "Visi, Misi & Kurikulum Merdeka", link: "/#program" },
    { label: "Ekstrakurikuler & Prestasi", link: "/#ekskul" },
    { label: "Jalur Zonasi & Prestasi PPDB", link: "/ppdb" },
    { label: "Biaya Pendidikan & Beasiswa", link: "/ppdb" },
  ],
  layananJudul: "Layanan PPDB",
  jamLayanan: "Senin – Jumat: 08.00 – 15.30 WIB\nSabtu: 08.30 – 12.00 WIB",
  alamat: "Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung, Kab. Lampung Selatan, Lampung",
  kanalJudul: "Kanal Resmi",
  kanalIntro: "Hubungi saluran konsultasi pendaftaran daring:",
  whatsapp: "6281200000000",
  email: "ppdb@smpmuh1jatiagung.sch.id",
  instagram: "@smpmuh1jatiagung",
  hakCipta: "© 2026 SMP Muhammadiyah 1 Jati Agung. Seluruh hak cipta dilindungi undang-undang.",
  tautanBawah: [
    { label: "Kebijakan Privasi", link: "#" },
    { label: "Ketentuan PPDB", link: "#" },
    { label: "Integritas Data Siswa", link: "#" },
  ],
};

export const contentDefaults = {
  header: headerDefaults,
  home: homeDefaults,
  ppdb: ppdbDefaults,
  footer: footerDefaults,
};

export type ContentKey = keyof typeof contentDefaults;
export type Content<K extends ContentKey> = (typeof contentDefaults)[K];

export const contentSections: { key: ContentKey; label: string }[] = [
  { key: "home", label: "Beranda" },
  { key: "ppdb", label: "Halaman PPDB" },
  { key: "header", label: "Header & Menu" },
  { key: "footer", label: "Footer & Kontak" },
];

export const isContentKey = (k: unknown): k is ContentKey => typeof k === "string" && k in contentDefaults;
