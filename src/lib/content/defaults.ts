/**
 * BLUEPRINT konten website (mirip Statamic): tiap bagian/fitur punya
 *  - `fields`   → bentuk form di panel admin (/dashboard/konten/<key>)
 *  - `defaults` → isi bawaan (sama dengan tampilan awal website)
 * Isi yang diedit admin disimpan di tabel SiteContent (key = key bagian) lalu digabung dengan defaults.
 *
 * Menambah fitur baru: tambahkan satu entri di `sections` + render-nya di halaman publik.
 */

/** Ikon/gambar: admin pilih pakai emoji atau unggah gambar. */
export type Media = { jenis: string; emoji: string; gambar: string };
const emoji = (e: string): Media => ({ jenis: "emoji", emoji: e, gambar: "" });

export type FieldDef =
  | { k: string; label: string; type: "text" | "textarea" | "url" | "date" | "number"; help?: string }
  | { k: string; label: string; type: "image"; help?: string } // string URL gambar
  | { k: string; label: string; type: "media"; help?: string } // Media
  | { k: string; label: string; type: "strings"; help?: string; itemLabel?: string } // string[]
  /** addable: true = admin bisa tambah/hapus/urutkan poin; false = hanya edit isi poin yang ada */
  | {
      k: string; label: string; type: "list"; help?: string; itemLabel: string; fields: FieldDef[]; titleKey?: string; addable?: boolean;
      /** Penanda "pemimpin" (mis. kepala sekolah): kolom boolean di tiap item, hanya boleh 1 yang true. Diatur lewat menu ⋮ */
      leader?: { key: string; label: string };
    };

export type SectionGroup = "beranda" | "global";

type Section<D> = { label: string; icon: string; group: SectionGroup; description: string; anchor?: string; fields: FieldDef[]; defaults: D };
const section = <D,>(s: Section<D>) => s;

const navbar = section({
  label: "Navbar",
  icon: "🧭",
  group: "global",
  description: "Logo, nama sekolah, menu navigasi, dan tombol daftar di bagian paling atas website.",
  fields: [
    { k: "logo", label: "Logo", type: "media" },
    { k: "nama", label: "Nama Sekolah", type: "text" },
    { k: "subjudul", label: "Subjudul", type: "text" },
    { k: "tombolDaftar", label: "Teks Tombol Daftar", type: "text", help: "Tombol hijau di kanan. Hanya tampil saat pendaftaran dibuka." },
    {
      k: "menu", label: "Menu", type: "list", itemLabel: "Menu", titleKey: "label",
      help: "Link ke section di beranda pakai format /#id, misalnya /#fasilitas.",
      fields: [
        { k: "label", label: "Teks Menu", type: "text" },
        { k: "link", label: "Link", type: "url" },
      ],
    },
  ],
  defaults: {
    logo: emoji("🌱"),
    nama: "SMP Muhammadiyah 1 Jati Agung",
    subjudul: "Portal Resmi & PPDB",
    tombolDaftar: "Daftar Sekarang",
    menu: [
      { label: "Beranda", link: "/" },
      { label: "Profil", link: "/#program" },
      { label: "Guru", link: "/#guru" },
      { label: "Fasilitas", link: "/#fasilitas" },
      { label: "Prestasi", link: "/#prestasi" },
      { label: "Ekskul", link: "/#ekskul" },
      { label: "Berita", link: "/berita" },
      { label: "Kontak", link: "/#kontak" },
    ],
  },
});

const hero = section({
  label: "Hero & Statistik",
  icon: "🏠",
  group: "beranda",
  anchor: "beranda",
  description: "Bagian pembuka beranda: judul besar, alamat, tombol, foto sekolah, dan kartu angka statistik.",
  fields: [
    { k: "chipBuka", label: "Label Atas (saat PPDB dibuka)", type: "text" },
    { k: "chipTutup", label: "Label Atas (saat PPDB ditutup)", type: "text" },
    { k: "eyebrow", label: "Teks Kecil di Atas Judul", type: "text" },
    { k: "judul", label: "Judul Besar", type: "text" },
    { k: "alamat", label: "Alamat", type: "textarea" },
    { k: "tombolDaftar", label: "Teks Tombol Daftar", type: "text" },
    { k: "tombolProfil", label: "Teks Tombol Profil", type: "text" },
    { k: "foto", label: "Foto Sekolah", type: "image", help: "Kosongkan untuk memakai ikon 🏫." },
    { k: "labelJudul", label: "Label Foto — Judul", type: "text" },
    { k: "labelSub", label: "Label Foto — Keterangan", type: "text" },
    {
      k: "statistik", label: "Kartu Statistik", type: "list", itemLabel: "Statistik", titleKey: "label",
      fields: [
        { k: "ikon", label: "Ikon", type: "media" },
        { k: "angka", label: "Angka", type: "text" },
        { k: "label", label: "Keterangan", type: "text" },
      ],
    },
  ],
  defaults: {
    chipBuka: "Penerimaan Siswa Baru (PPDB) 2026/2027 Telah Dibuka",
    chipTutup: "Pendaftaran Siswa Baru Saat Ini Ditutup",
    eyebrow: "Sekolah Swasta Islam · Zona Nyaman & Menyenangkan",
    judul: "SMP MUHAMMADIYAH 1 JATI AGUNG",
    alamat: "Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung",
    tombolDaftar: "Daftar PPDB 2026/2027 →",
    tombolProfil: "🏫 Profil Sekolah",
    foto: "",
    labelJudul: "Sekolah Swasta Islam",
    labelSub: "Zona nyaman & menyenangkan",
    statistik: [
      { ikon: emoji("📅"), angka: "1993", label: "Sekolah berdiri sejak" },
      { ikon: emoji("🎓"), angka: "58", label: "Jumlah siswa" },
      { ikon: emoji("👩‍🏫"), angka: "11", label: "Tenaga pendidik" },
    ],
  },
});

const sambutan = section({
  label: "Sambutan & Visi Misi",
  icon: "💬",
  group: "beranda",
  anchor: "program",
  description: "Kutipan dan paragraf sambutan / visi misi. Foto & nama kepala sekolah diatur di Guru & Staf (menu ⋮ → Jadikan Kepala Sekolah).",
  fields: [
    { k: "eyebrow", label: "Judul Kecil", type: "text" },
    { k: "kutipan", label: "Kutipan", type: "textarea" },
    { k: "isi", label: "Isi Sambutan", type: "textarea", help: "Pisahkan paragraf dengan baris kosong." },
  ],
  defaults: {
    eyebrow: "Visi dan Misi Sekolah",
    kutipan: "“Setiap anak adalah bibit unggul yang bertumbuh optimal di tanah yang penuh kasih dan keteladanan.”",
    isi: "Selamat datang di SMP Muhammadiyah 1 Jati Agung. Memasuki usia remaja awal adalah fase transisi krusial di mana rasa ingin tahu, kecerdasan moral, dan kesadaran sosial mulai berakar kuat. Kami meyakini bahwa pendidikan sejati bukan semata tentang tumpukan nilai kognitif, melainkan penempaan integritas budi pekerti yang selaras dengan kecintaan terhadap sesama dan alam semesta.",
  },
});

const guru = section({
  label: "Guru & Staf",
  icon: "👩‍🏫",
  group: "beranda",
  anchor: "guru",
  description: "Daftar guru & staf: foto, nama, mata pelajaran. Kepala sekolah ditandai lewat menu ⋮ (hanya boleh 1).",
  fields: [
    { k: "eyebrow", label: "Judul Kecil", type: "text" },
    { k: "judul", label: "Judul", type: "text" },
    { k: "subjudul", label: "Subjudul", type: "text" },
    {
      k: "daftar", label: "Daftar Guru", type: "list", itemLabel: "Guru", titleKey: "nama", addable: true,
      leader: { key: "kepalaSekolah", label: "Kepala Sekolah" },
      help: "Geser ⠿ untuk mengubah urutan. Kepala sekolah tampil di bagian Sambutan beranda.",
      fields: [
        { k: "foto", label: "Foto", type: "image", help: "Kosongkan untuk memakai ikon 👤." },
        { k: "nama", label: "Nama", type: "text" },
        { k: "mapel", label: "Mata Pelajaran / Jabatan", type: "text" },
      ],
    },
  ],
  defaults: {
    eyebrow: "Guru & Staf",
    judul: "Tenaga Pendidik",
    subjudul: "Dibimbing oleh guru-guru profesional yang ahli di bidangnya.",
    daftar: [
      { foto: "", nama: "Julianto", mapel: "Kepala Sekolah SMP Muhammadiyah 1 Jati Agung", kepalaSekolah: true },
      { foto: "/guru/sumaryanto.jpg", nama: "Sumaryanto", mapel: "PJOK, Seni dan Prakarya", kepalaSekolah: false },
      { foto: "/guru/alveno.jpg", nama: "Alveno Danar Fadill", mapel: "Bahasa Arab, Tahfidz Al-Qur'an", kepalaSekolah: false },
      { foto: "/guru/fiki.jpg", nama: "Fiki Riyanto", mapel: "Hizbul Wathan", kepalaSekolah: false },
      { foto: "/guru/mia.jpg", nama: "Mia Noviyanti, S.Pd", mapel: "Matematika dan Informatika", kepalaSekolah: false },
      { foto: "/guru/siti.jpg", nama: "Siti Wardani", mapel: "Aqidah Akhlak", kepalaSekolah: false },
      { foto: "/guru/kuswati.jpg", nama: "Kuswati", mapel: "IPA dan PAk", kepalaSekolah: false },
      { foto: "/guru/duwi.jpg", nama: "Duwi Supriyanti", mapel: "IPS", kepalaSekolah: false },
      { foto: "/guru/rahmat.jpg", nama: "RAHMAT, S.Pd", mapel: "Bahasa Indonesia", kepalaSekolah: false },
      { foto: "/guru/halusah.jpg", nama: "Halusah", mapel: "Bahasa Inggris", kepalaSekolah: false },
      { foto: "/guru/supono.jpg", nama: "Supono", mapel: "PAI dan PKN", kepalaSekolah: false },
    ],
  },
});

const fasilitas = section({
  label: "Fasilitas",
  icon: "🏫",
  group: "beranda",
  anchor: "fasilitas",
  description: "Kartu sarana & prasarana. Bisa tambah / hapus; jumlah kartu menyesuaikan.",
  fields: [
    { k: "eyebrow", label: "Judul Kecil", type: "text" },
    { k: "judul", label: "Judul", type: "text" },
    {
      k: "daftar", label: "Daftar Fasilitas", type: "list", itemLabel: "Fasilitas", titleKey: "judul", addable: true,
      fields: [
        { k: "media", label: "Gambar / Emoji", type: "media" },
        { k: "judul", label: "Nama Fasilitas", type: "text" },
        { k: "deskripsi", label: "Deskripsi", type: "textarea" },
      ],
    },
  ],
  defaults: {
    eyebrow: "Sarana & Prasarana",
    judul: "Fasilitas SMP Muhammadiyah 1 Jati Agung",
    daftar: [
      { media: emoji("🏫"), judul: "Ruang Kelas", deskripsi: "Ruang belajar yang bersih dan nyaman untuk kegiatan belajar sehari-hari." },
      { media: emoji("🏢"), judul: "Kantor", deskripsi: "Tempat guru dan staf bekerja, sekaligus melayani orang tua dan tamu yang ingin bertanya atau mengurus keperluan sekolah." },
    ],
  },
});

const prestasi = section({
  label: "Prestasi",
  icon: "🏆",
  group: "beranda",
  anchor: "prestasi",
  description: "Kartu prestasi siswa. Bisa tambah / hapus; jumlah kartu menyesuaikan.",
  fields: [
    { k: "eyebrow", label: "Judul Kecil", type: "text", help: "Boleh dikosongkan." },
    { k: "judul", label: "Judul", type: "text" },
    { k: "chip", label: "Label Kanan (mis. Tahun Ajaran)", type: "text" },
    {
      k: "daftar", label: "Daftar Prestasi", type: "list", itemLabel: "Prestasi", titleKey: "judul", addable: true,
      fields: [
        { k: "media", label: "Ikon / Gambar", type: "media" },
        { k: "lencana", label: "Lencana (mis. Juara 1)", type: "text" },
        { k: "judul", label: "Nama Lomba", type: "text" },
        { k: "deskripsi", label: "Deskripsi", type: "textarea" },
        { k: "oleh", label: "Diraih Oleh", type: "text" },
      ],
    },
  ],
  defaults: {
    eyebrow: "",
    judul: "Prestasi Siswa",
    chip: "Tahun Ajaran 2026/2027",
    daftar: [
      { media: emoji("🏅"), lencana: "-", judul: "-", deskripsi: "-", oleh: "-" },
      { media: emoji("🏅"), lencana: "-", judul: "-", deskripsi: "-", oleh: "-" },
    ],
  },
});

const ekskul = section({
  label: "Ekstrakurikuler",
  icon: "⚽",
  group: "beranda",
  anchor: "ekskul",
  description: "Daftar ekskul. Pengunjung bisa klik salah satu ekskul untuk melihat penjelasannya.",
  fields: [
    { k: "eyebrow", label: "Judul Kecil", type: "text" },
    { k: "judul", label: "Judul", type: "text" },
    {
      k: "daftar", label: "Daftar Ekskul", type: "list", itemLabel: "Ekskul", titleKey: "nama", addable: true,
      fields: [
        { k: "media", label: "Ikon / Gambar", type: "media" },
        { k: "nama", label: "Nama Ekskul", type: "text" },
        { k: "keterangan", label: "Keterangan Singkat", type: "text" },
        { k: "deskripsi", label: "Penjelasan (muncul saat ekskul diklik)", type: "textarea" },
      ],
    },
  ],
  defaults: {
    eyebrow: "Ekstrakurikuler",
    judul: "Ekstrakurikuler Pilihan & Bakat Minat",
    daftar: [
      { media: emoji("🤖"), nama: "Robotik & AI", keterangan: "STEM Terapan", deskripsi: "Mengembangkan kemampuan STEM melalui proyek robotika dan IoT yang terstruktur." },
      { media: emoji("🎤"), nama: "English Debate", keterangan: "Model UN & Speech", deskripsi: "Melatih kepercayaan diri dan kemampuan berbahasa Inggris lewat debat, pidato, dan simulasi sidang PBB." },
      { media: emoji("🌱"), nama: "Eco Hidroponik", keterangan: "Urban Farming Club", deskripsi: "Praktik hidroponik dan konservasi tanaman untuk memupuk rasa hormat pada alam." },
      { media: emoji("🥋"), nama: "Taekwondo & Silat", keterangan: "Bela Diri Prestasi", deskripsi: "Membangun disiplin, ketangguhan fisik, dan sportivitas melalui latihan bela diri yang terarah." },
      { media: emoji("🏀"), nama: "Basket & Futsal", keterangan: "Lapangan Standar FIBA", deskripsi: "Mengasah kerja sama tim dan kebugaran lewat latihan rutin serta pertandingan persahabatan." },
      { media: emoji("🎶"), nama: "Seni & Musik", keterangan: "Ensembel & Ilustrasi", deskripsi: "Wadah menyalurkan kreativitas lewat ensembel musik, menggambar, dan ilustrasi." },
    ],
  },
});

const footer = section({
  label: "Footer & Kontak",
  icon: "📞",
  group: "global",
  anchor: "kontak",
  description: "Bagian paling bawah website: profil singkat, link navigasi, jam layanan, alamat, dan kontak resmi.",
  fields: [
    { k: "akreditasi", label: "Akreditasi", type: "text" },
    { k: "deskripsi", label: "Deskripsi Singkat", type: "textarea" },
    { k: "npsn", label: "NPSN / Info Kecil", type: "text" },
    { k: "navJudul", label: "Judul Kolom Navigasi", type: "text" },
    {
      k: "navLinks", label: "Link Navigasi", type: "list", itemLabel: "Link", titleKey: "label",
      fields: [
        { k: "label", label: "Teks", type: "text" },
        { k: "link", label: "Link", type: "url" },
      ],
    },
    { k: "layananJudul", label: "Judul Kolom Layanan", type: "text" },
    { k: "jamLayanan", label: "Jam Layanan", type: "textarea", help: "Satu baris per jadwal." },
    { k: "alamat", label: "Alamat Sekolah", type: "textarea" },
    { k: "kanalJudul", label: "Judul Kolom Kontak", type: "text" },
    { k: "kanalIntro", label: "Teks Pengantar Kontak", type: "text" },
    { k: "whatsapp", label: "Nomor WhatsApp", type: "text", help: "Format 628xxxxxxxxxx (tanpa + dan spasi)." },
    { k: "email", label: "Email", type: "text" },
    { k: "instagram", label: "Instagram", type: "text" },
    { k: "hakCipta", label: "Teks Hak Cipta", type: "text" },
    {
      k: "tautanBawah", label: "Link Paling Bawah", type: "list", itemLabel: "Link", titleKey: "label",
      fields: [
        { k: "label", label: "Teks", type: "text" },
        { k: "link", label: "Link", type: "url" },
      ],
    },
  ],
  defaults: {
    akreditasi: "Terakreditasi A+ (Unggul)",
    deskripsi: "Membina generasi cendekia berakhlak mulia, berwawasan lingkungan lestari, dan berdaya saing global melalui ekosistem pendidikan holistik dan bersahaja.",
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
  },
});

const ppdb = section({
  label: "Halaman PPDB",
  icon: "📝",
  group: "global",
  description: "Teks di halaman pendaftaran (/ppdb), termasuk pesan saat pendaftaran ditutup.",
  fields: [
    { k: "breadcrumb", label: "Judul Breadcrumb", type: "text" },
    { k: "tickerBuka", label: "Info Atas (saat dibuka)", type: "text", help: "Diikuti otomatis oleh tanggal tutup yang diisi saat membuka pendaftaran (Overview → Buka Pendaftaran)." },
    { k: "tickerBukaTanpaBatas", label: "Info Atas (dibuka, tanpa tanggal tutup)", type: "text", help: "Hanya untuk data lama yang dibuka sebelum ada tanggal tutup." },
    { k: "tickerTutup", label: "Info Atas (saat ditutup)", type: "text" },
    { k: "judulTutup", label: "Judul Saat Ditutup", type: "text" },
    { k: "pesanTutup", label: "Pesan Saat Ditutup", type: "textarea" },
  ],
  defaults: {
    breadcrumb: "Pendaftaran Siswa Baru (PPDB 2026/2027)",
    tickerBuka: "Pendaftaran dibuka hingga",
    tickerBukaTanpaBatas: "Pendaftaran sedang dibuka",
    tickerTutup: "Pendaftaran saat ini ditutup",
    judulTutup: "Pendaftaran Sedang Ditutup",
    pesanTutup: "Terima kasih atas minat Anda. Pendaftaran siswa baru saat ini belum dibuka / sudah ditutup. Pantau informasi terbaru atau hubungi panitia melalui WhatsApp.",
  },
});

export const sections = { hero, sambutan, guru, fasilitas, prestasi, ekskul, navbar, footer, ppdb };

export type ContentKey = keyof typeof sections;
export type Content<K extends ContentKey> = (typeof sections)[K]["defaults"];

export const contentDefaults = Object.fromEntries(
  Object.entries(sections).map(([k, s]) => [k, s.defaults]),
) as { [K in ContentKey]: Content<K> };

export const isContentKey = (k: unknown): k is ContentKey => typeof k === "string" && k in sections;

export const sectionGroups: { key: SectionGroup; label: string }[] = [
  { key: "beranda", label: "Konten Beranda" },
  { key: "global", label: "Navigasi & Global" },
];
