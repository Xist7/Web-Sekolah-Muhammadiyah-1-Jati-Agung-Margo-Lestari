# Website Profil SMP Muhammadiyah 1 Jati Agung

Website profil sekolah sebagai media informasi dan PPDB untuk **SMP Muhammadiyah 1 Jati Agung**, Desa Margo Lestari, Kec. Jati Agung, Kab. Lampung Selatan.

Proyek Mata Kuliah Kapita Selekta Informatika — Teknik Informatika ITERA 2026, berorientasi SDGs Desa **Tujuan 4.4 (indikator 4.4.1.a)**: keterampilan TIK.

---

## SKPL Singkat (Spesifikasi Kebutuhan Perangkat Lunak)

### 1. Pendahuluan

**Tujuan.** Menyediakan kanal informasi digital resmi yang bisa diakses publik, karena saat ini informasi sekolah (profil, guru, PPDB) hanya tersedia lewat lisan, brosur, atau datang langsung ke sekolah.

**Lingkup.** Website open web (tanpa login untuk pengunjung) dengan panel admin untuk mengelola konten. Di luar lingkup: administrasi akademik, rapor elektronik.

**Definisi.**
| Istilah | Arti |
|---|---|
| PPDB | Penerimaan Peserta Didik Baru |
| Admin | Guru/petugas sekolah yang mengelola konten |
| Pengunjung | Calon siswa, orang tua/wali, masyarakat umum |

### 2. Deskripsi Umum

**Pengguna.**
| Aktor | Deskripsi | Hak Akses |
|---|---|---|
| Pengunjung | Calon siswa, orang tua/wali, masyarakat | Melihat seluruh informasi publik, mengisi formulir PPDB |
| Admin | Petugas sekolah yang ditunjuk | Login, mengelola semua konten & data pendaftar |

**Asumsi & batasan.**
- Mayoritas pengunjung memakai smartphone → desain **mobile-first**.
- Literasi digital orang tua beragam → navigasi sederhana.
- Jumlah siswa diinput manual oleh admin (bukan dihitung otomatis).
- Konten menyesuaikan identitas keislaman Muhammadiyah.

### 3. Kebutuhan Fungsional

| Kode | Kebutuhan | Aktor |
|---|---|---|
| F-01 | Menampilkan profil sekolah: informasi umum, sejarah, visi & misi, fasilitas | Pengunjung |
| F-02 | Menampilkan informasi guru & tenaga kependidikan (nama, jabatan/mapel, foto) | Pengunjung |
| F-03 | Menampilkan informasi PPDB: jadwal, syarat, alur, biaya | Pengunjung |
| F-04 | Mengisi dan mengirim formulir pendaftaran PPDB secara daring | Pengunjung |
| F-05 | Menampilkan kontak sekolah: alamat, peta, contact person/WhatsApp | Pengunjung |
| F-06 | Menampilkan jumlah peserta didik | Pengunjung |
| F-07 | Menampilkan galeri kegiatan sekolah | Pengunjung |
| F-08 | Login & logout admin | Admin |
| F-09 | CRUD profil sekolah, visi-misi, fasilitas | Admin |
| F-10 | CRUD data guru & tendik | Admin |
| F-11 | CRUD informasi PPDB | Admin |
| F-12 | Melihat & mengelola data pendaftar PPDB | Admin |
| F-13 | Memperbarui kontak sekolah | Admin |
| F-14 | Memperbarui jumlah siswa secara manual | Admin |
| F-15 | CRUD galeri kegiatan | Admin |

> Modul wajib (target SDGs): profil sekolah, informasi guru, informasi PPDB, kontak sekolah, jumlah siswa.

### 4. Kebutuhan Non-Fungsional

| Kode | Kategori | Kebutuhan |
|---|---|---|
| NF-01 | Performa | Waktu muat halaman < 3 detik |
| NF-02 | Usability | Responsif & mobile-first, navigasi sederhana |
| NF-03 | Ketersediaan | Online dan dapat diakses publik 24/7 via domain |
| NF-04 | Keamanan | Panel admin dilindungi autentikasi, password di-hash, validasi input formulir |
| NF-05 | Maintainability | Konten dapat diperbarui admin tanpa menyentuh kode |
| NF-06 | Kompatibilitas | Berjalan di browser modern (Chrome, Firefox, Edge, Safari mobile) |
| NF-07 | Analitik | Tercatat jumlah pengakses unik (log analitik) |

### 5. Kriteria Penerimaan

- 1 website aktif dengan URL publik + serah terima domain & akses admin ke sekolah.
- Seluruh modul lolos **black-box testing**.
- Lolos uji responsivitas berbagai ukuran layar dan waktu muat < 3 detik.
- Admin sekolah sudah dilatih dan mampu mengelola konten secara mandiri.

---

## Tim (Kelompok 3)

| NIM | Nama | Peran |
|---|---|---|
| 124140001 | Galih Sigit Satrio | Project Manager |
| 124140103 | Kenzie Sahasika Tariana | UI/UX Designer |
| 124140027 | Divania Rosanti C. Munthe | Frontend Developer |
| 124140123 | Adelia Eva Ananta | Frontend Developer |
| 124140097 | Christopher Leon Saputra | Backend Developer |
| 124140092 | Fachri Dwi Nugroho | Software Tester |

**Mitra:** SMP Muhammadiyah 1 Jati Agung — Jl. Hadi Subroto, Margo Lestari, Jati Agung, Lampung Selatan.
