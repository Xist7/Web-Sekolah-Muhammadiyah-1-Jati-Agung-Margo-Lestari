export type Guru = { nama: string; mapel: string; foto: string };

// Ambil ID file dari link Google Drive (format link apa pun)
const driveId = (url: string) => url.match(/[-\w]{25,}/)?.[0] ?? "";
const fotoDrive = (url: string) => `https://drive.google.com/thumbnail?id=${driveId(url)}&sz=w400`;

export const guru: Guru[] = [
  { nama: "Sumaryanto", mapel: "PJOK, Seni dan Prakarya", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Alveno Danar Fadill", mapel: "Bahasa Arab, Tahfidz Al-Qur'an", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Fiki Riyanto", mapel: "Hizbul Wathan", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Mia Noviyanti, S.Pd", mapel: "Matematika dan Informatika", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Siti Wardani", mapel: "Aqidah Akhlak", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Kuswati", mapel: "IPA dan PAk", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Duwi Supriyanti", mapel: "IPS", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "RAHMAT, S.Pd", mapel: "Bahasa Indonesia", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Halusah", mapel: "Bahasa Inggris", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
  { nama: "Supono", mapel: "PAI dan PKN", foto: fotoDrive("TEMPEL_LINK_FOTO_DI_SINI") },
];