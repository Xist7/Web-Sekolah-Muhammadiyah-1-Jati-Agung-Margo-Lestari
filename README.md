# Website Profil SMP Muhammadiyah 1 Jati Agung

Website profil sekolah sebagai media informasi dan PPDB untuk **SMP Muhammadiyah 1 Jati Agung**, Desa Margo Lestari, Kec. Jati Agung, Kab. Lampung Selatan.

Proyek Mata Kuliah Kapita Selekta Informatika — Teknik Informatika ITERA 2026, berorientasi SDGs Desa **Tujuan 4.4 (indikator 4.4.1.a)**: keterampilan TIK.

Lompat ke: 📄 [SKPL](#skpl-singkat-spesifikasi-kebutuhan-perangkat-lunak) · ⚙️ [Setup Lokal](#setup-lokal) · 🚀 [Deploy](#deploy-ke-vercel) · 🔧 [Panduan Git & GitHub](#panduan-git--github-untuk-tim)

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

## Teknologi (semua gratis)

| Bagian | Pakai | Free tier |
|---|---|---|
| Framework | Next.js 16 (App Router) + Tailwind CSS 4 + TypeScript | — |
| Database | PostgreSQL di [Neon](https://neon.tech) + Prisma ORM 7 | 0.5 GB, cukup untuk web sekolah |
| Login admin | Auth.js (NextAuth v5) + Google OAuth, dibatasi `ADMIN_EMAILS` | Gratis |
| Hosting | [Vercel](https://vercel.com) Hobby | Gratis |

## Struktur Project

```
prisma/
  schema.prisma        model database (profil, guru, fasilitas, PPDB, pendaftar, galeri)
  migrations/          riwayat perubahan tabel (JANGAN diedit manual)
  seed.ts              data awal
src/
  app/page.tsx         halaman sementara untuk cek DB + login (nanti diganti tim FE)
  app/api/auth/        route bawaan Auth.js (login/logout Google)
  auth.ts              konfigurasi Google OAuth
  lib/db.ts            Prisma client (dipakai untuk query database)
  generated/prisma/    hasil `prisma generate` (otomatis, tidak di-commit)
.env.example           contoh environment variable
prisma.config.ts       konfigurasi Prisma CLI
```

**Pembagian area kerja:**

| Tim | Area utama |
|---|---|
| UI/UX | Desain di Figma, aset gambar di `public/` |
| Frontend | Halaman & komponen di `src/app/` dan `src/components/` |
| Backend | `prisma/`, `src/lib/`, `src/auth.ts`, server actions / route handler |
| Tester | Black-box testing tiap modul, laporkan bug lewat tab **Issues** |

---

## Setup Lokal

### 1. Yang perlu di-install (sekali saja)

- [Node.js](https://nodejs.org) versi **20 atau lebih baru** (cek: `node -v`)
- [Git](https://git-scm.com/downloads) (cek: `git --version`)
- Editor: [VS Code](https://code.visualstudio.com), disarankan pasang extension *Prisma*, *Tailwind CSS IntelliSense*, dan *ESLint*

### 2. Clone & install

```bash
git clone https://github.com/Xist7/Web-Sekolah-Muhammadiyah-1-Jati-Agung-Margo-Lestari.git
cd Web-Sekolah-Muhammadiyah-1-Jati-Agung-Margo-Lestari
git checkout dev
npm install
```

### 3. Isi file `.env`

```bash
cp .env.example .env
```

> `.env` berisi password/secret. **Jangan pernah di-commit** (sudah masuk `.gitignore`). Minta isi `.env` ke tim Backend lewat chat pribadi, jangan disebar di grup.

| Variabel | Dapat dari mana |
|---|---|
| `DATABASE_URL` | Neon → project → **Connect** → *Connection pooling* **nyala** → salin |
| `DIRECT_URL` | Sama, tapi *Connection pooling* **dimatikan** |
| `AUTH_SECRET` | Jalankan `npx auth secret`, salin hasilnya |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console (lihat langkah 4) |
| `ADMIN_EMAILS` | Email Google yang boleh login admin, pisahkan koma |

**Cara cepat tanpa Neon (khusus coba-coba lokal):** jalankan `npx prisma dev -n smpmuh --detach`, salin URL `postgres://...` yang muncul ke `DATABASE_URL` (`DIRECT_URL` boleh dihapus). Matikan dengan `npx prisma dev stop smpmuh`.

### 4. Buat Google OAuth (cukup 1 orang, biasanya Backend)

1. Buka [Google Cloud Console](https://console.cloud.google.com) → buat project baru.
2. **APIs & Services → OAuth consent screen** → pilih *External*, isi nama app & email, simpan. Tambahkan email anggota tim di *Test users*.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.**
4. Di *Authorized redirect URIs*, tambahkan:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<nama-project>.vercel.app/api/auth/callback/google` (setelah deploy)
5. Salin **Client ID** & **Client Secret** ke `.env`, lalu bagikan ke tim lewat chat pribadi.

### 5. Siapkan database & jalankan

```bash
npm run db:migrate    # buat / update tabel sesuai schema
npm run db:seed       # isi data awal (profil sekolah & info PPDB)
npm run dev           # jalankan di http://localhost:3000
```

Buka http://localhost:3000. Kalau status **Database: terhubung** dan tombol **Login dengan Google** berfungsi, setup berhasil. 🎉

### Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan server development (auto reload) |
| `npm run build` | Build production (coba sebelum PR besar) |
| `npm run lint` | Cek kesalahan kode (ESLint) |
| `npm run db:migrate` | Terapkan perubahan `schema.prisma` ke database |
| `npm run db:seed` | Isi data awal |
| `npm run db:studio` | Buka Prisma Studio (lihat/edit isi database lewat browser) |

### Mengubah struktur database (khusus Backend)

1. Edit `prisma/schema.prisma`.
2. `npm run db:migrate -- --name tambah_kolom_x` (nama singkat, pakai underscore).
3. Commit **schema + folder migrasi baru** di `prisma/migrations/` dalam satu commit.
4. Anggota lain cukup `git pull` lalu `npm run db:migrate`.

### Masalah yang sering muncul

| Error | Solusi |
|---|---|
| `Cannot find module '@/generated/prisma/client'` | Jalankan `npx prisma generate` |
| `Can't reach database server` | Cek `DATABASE_URL` di `.env`; kalau pakai `prisma dev`, pastikan sudah dijalankan |
| Login Google: `redirect_uri_mismatch` | Redirect URI di Google Console belum ditambahkan / salah ketik |
| Login ditolak (`AccessDenied`) | Email belum ada di `ADMIN_EMAILS` atau belum jadi *Test user* |
| Port 3000 sudah dipakai | Ada `npm run dev` lain yang masih jalan, matikan dulu (Ctrl + C) |
| Habis `git pull` jadi error | Jalankan `npm install` lalu `npm run db:migrate` |

---

## Deploy ke Vercel

1. Login [vercel.com](https://vercel.com) pakai GitHub → **Add New → Project** → import repo ini.
2. Isi **Environment Variables**: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`.
   (Atau lewat **Storage → Neon** di dashboard Vercel, `DATABASE_URL` terisi otomatis.)
3. Tambahkan redirect URI produksi di Google Console (lihat langkah 4 di atas).
4. Deploy. Script `vercel-build` otomatis menjalankan `prisma migrate deploy` sebelum `next build`.

- Branch **`main`** → deploy **production** (yang dibuka sekolah & publik).
- Branch lain / PR → Vercel otomatis bikin **preview URL** buat dicek sebelum merge.

---

## Panduan Git & GitHub untuk Tim

Bagian ini buat anggota tim yang belum terbiasa pakai Git. Ikuti urutannya.

### Struktur Branch

```
main        ← versi stabil / production (yang di-deploy ke sekolah). Hanya diisi dari dev, lewat PR.
 └─ dev     ← branch development, tempat semua fitur digabung & dites.
     ├─ divania/halaman-profil
     ├─ adelia/form-ppdb
     ├─ leon/crud-guru
     └─ ...  ← branch masing-masing, dibuat dari dev
```

### Aturan Emas

1. **Jangan commit / push langsung ke `main` maupun `dev`.** Kerja selalu di branch sendiri.
2. **Setiap push ke branch sendiri → buka Pull Request (PR) ke `dev`.** Kalau PR-nya sudah ada, push berikutnya otomatis masuk ke PR yang sama.
3. **Base PR selalu `dev`, BUKAN `main`.** `dev` untuk development; `main` hanya diisi dari `dev` saat versi sudah stabil & lolos testing.
4. **Kalau sudah ngerti cara merge, merge-nya ke `dev`, jangan ke `main`.** Pastikan sudah ada minimal 1 orang lain yang review.
5. Selalu **update dari `dev`** sebelum mulai ngoding.
6. Satu branch = satu fitur/tugas. Jangan campur kerjaan beda-beda.
7. Commit kecil dan sering, dengan pesan yang jelas.
8. Jangan edit file yang sama barengan tanpa kabar di grup (terutama `prisma/schema.prisma`, `package.json`, dan file `layout.tsx`).

### Setup Git Pertama Kali (sekali saja)

```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email@akun-github.com"
```

Minta owner repo (**Xist7**) nambahin kamu sebagai *collaborator* biar bisa push branch.

### Alur Kerja Harian

**1. Sebelum mulai ngoding: update `dev` dulu**

```bash
git checkout dev
git fetch origin
git pull origin dev
```

`git fetch` ngambil info terbaru dari GitHub, `git pull` menggabungkannya ke `dev` lokal kamu.
Kalau ada perubahan di `package.json` / `prisma/`, jalankan juga `npm install` dan `npm run db:migrate`.

**2. Buat branch baru untuk tugasmu (dari `dev`)**

```bash
git checkout -b nama-kamu/nama-fitur
```

Contoh nama branch: `divania/halaman-profil`, `adelia/form-ppdb`, `leon/crud-guru`, `kenzie/aset-logo`, `fachri/fix-navbar-mobile`.

Kalau branch-nya sudah ada (lanjut kerjaan kemarin):

```bash
git checkout nama-kamu/nama-fitur
git fetch origin
git merge origin/dev      # biar branch kamu ikut update dengan dev terbaru
```

**3. Ngoding, lalu cek apa saja yang berubah**

```bash
git status
npm run lint              # pastikan tidak ada error sebelum commit
```

**4. Commit perubahan**

```bash
git add .
git commit -m "Tambah halaman profil sekolah"
```

Tips pesan commit: singkat dan jelas, misalnya `"Tambah form PPDB"`, `"Fix navbar di HP"`, `"Tambah tabel galeri"`. Hindari `"update"` atau `"asdf"`.

**5. Push branch kamu ke GitHub**

```bash
git push -u origin nama-kamu/nama-fitur
```

`-u` cukup di push pertama. Selanjutnya cukup `git push`.

**6. Buka Pull Request (PR) ke `dev` — wajib setiap habis push**

1. Buka https://github.com/Xist7/Web-Sekolah-Muhammadiyah-1-Jati-Agung-Margo-Lestari
2. Klik tombol kuning **Compare & pull request** (atau tab **Pull requests → New pull request**).
3. ⚠️ **Pastikan `base: dev` ← `compare: nama-kamu/nama-fitur`.** Kalau base masih `main`, ganti ke `dev`!
4. Isi judul + jelaskan singkat apa yang diubah (kalau tampilan, tempel screenshot).
5. Klik **Create pull request**, lalu kabarin tim di grup.
6. Kalau kerjaan belum selesai tapi mau di-push dulu, pilih **Create draft pull request**. Push berikutnya otomatis masuk ke PR itu, tidak perlu bikin PR baru.

**7. Review & merge (ke `dev`)**

- Minimal 1 orang lain cek dulu (cek juga *preview URL* dari Vercel di PR).
- Yang sudah ngerti merge boleh klik **Merge pull request**, **pastikan base-nya `dev`**.
- Kalau belum yakin, biarkan PM/Backend yang merge.

**8. Setelah PR di-merge**

```bash
git checkout dev
git pull origin dev
git branch -d nama-kamu/nama-fitur   # hapus branch lokal yang sudah selesai
```

Lalu mulai lagi dari langkah 1 untuk tugas berikutnya.

**Rilis ke `main`** (khusus PM/Backend): setelah `dev` stabil & lolos testing, buka PR `dev → main`, review, lalu merge. Vercel otomatis deploy ke production.

### Kapan Push, Kapan Pull?

| Situasi | Lakukan |
|---|---|
| Mau mulai ngoding | `git fetch origin` lalu `git pull origin dev` (di `dev`), baru bikin/pindah branch |
| Selesai satu bagian kerjaan (walau belum beres semua) | commit → push ke branch sendiri → buka/update PR (draft) ke `dev` |
| Mau udahan ngoding hari ini | commit + push ke branch sendiri |
| Ada PR teman yang baru di-merge ke `dev` | `git fetch origin` lalu `git merge origin/dev` di branch kamu |
| Fitur sudah selesai | push, ubah PR dari draft jadi *Ready for review*, minta review |

### Kalau Ada Conflict

Conflict terjadi kalau kamu dan teman ngedit bagian file yang sama. Git akan nandain filenya seperti ini:

```
<<<<<<< HEAD
kode versi kamu
=======
kode versi dari dev
>>>>>>> origin/dev
```

Cara beresin:

1. Buka file yang conflict (`git status` akan nunjukin filenya). Di VS Code ada tombol *Accept Current / Incoming / Both*.
2. Pilih kode yang benar (atau gabungkan), lalu hapus tanda `<<<<<<<`, `=======`, `>>>>>>>`.
3. Simpan, lalu:

```bash
git add .
git commit -m "Resolve conflict dengan dev"
git push
```

- Conflict di `package-lock.json`: ambil versi dev (`git checkout origin/dev -- package-lock.json`), jalankan `npm install`, lalu commit.
- Conflict di `prisma/schema.prisma` atau `prisma/migrations/`: **jangan asal pilih**, tanya Backend dulu.

### Perintah Penting (Cheat Sheet)

| Perintah | Fungsi |
|---|---|
| `git status` | Lihat file yang berubah & sedang di branch mana |
| `git branch` | Lihat daftar branch lokal (`*` = branch aktif) |
| `git checkout nama-branch` | Pindah branch |
| `git checkout -b nama-branch` | Bikin branch baru dan langsung pindah |
| `git fetch origin` | Ambil info terbaru dari GitHub (tanpa mengubah file kamu) |
| `git pull origin dev` | Ambil dan gabungkan perubahan terbaru `dev` |
| `git merge origin/dev` | Gabungkan `dev` terbaru ke branch kamu |
| `git add .` | Siapkan semua perubahan untuk di-commit |
| `git commit -m "pesan"` | Simpan perubahan dengan pesan |
| `git push` | Kirim commit ke GitHub |
| `git log --oneline` | Lihat riwayat commit |
| `git restore nama-file` | Batalkan perubahan file yang belum di-commit (hilang permanen, hati-hati) |

### Hal yang Jangan Dilakukan

- ❌ Commit/push langsung ke `main` atau `dev`.
- ❌ Buka PR dengan base `main` (harus `dev`).
- ❌ Merge ke `main` tanpa persetujuan PM/Backend.
- ❌ `git push --force` (bisa ngehapus kerjaan orang lain).
- ❌ Commit file `.env` atau nyebar secret di grup.
- ❌ Mulai ngoding tanpa fetch/pull `dev` dulu.
- ❌ Merge PR sendiri tanpa ada yang ngecek.
- ❌ Edit manual file di `prisma/migrations/`.

Kalau bingung atau ada error aneh, **berhenti dulu dan tanya di grup**, jangan coba-coba perintah random. Lebih aman nanya daripada kerjaan hilang.

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
