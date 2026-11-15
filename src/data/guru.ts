export type Guru = { nama: string; mapel: string; foto: string };

// Foto ada di public/guru/. Kalau file belum ada, otomatis tampil inisial.
export const guru: Guru[] = [
  { nama: "Sumaryanto", mapel: "PJOK, Seni dan Prakarya", foto: "/guru/sumaryanto.jpg" },
  { nama: "Alveno Danar Fadill", mapel: "Bahasa Arab, Tahfidz Al-Qur'an", foto: "/guru/alveno-danar-fadill.jpg" },
  { nama: "Fiki Riyanto", mapel: "Hizbul Wathan", foto: "/guru/fiki-riyanto.png" },
  { nama: "Mia Noviyanti, S.Pd", mapel: "Matematika dan Informatika", foto: "/guru/mia-noviyanti.jpg" },
  { nama: "Siti Wardani", mapel: "Aqidah Akhlak", foto: "/guru/siti-wardani.jpg" },
  { nama: "Kuswati", mapel: "IPA dan PAk", foto: "/guru/kuswati.jpg" },
  { nama: "Duwi Supriyanti", mapel: "IPS", foto: "/guru/duwi-supriyanti.jpg" },
  { nama: "RAHMAT, S.Pd", mapel: "Bahasa Indonesia", foto: "/guru/rahmat.jpg" },
  { nama: "Halusah", mapel: "Bahasa Inggris", foto: "/guru/halusah.jpg" },
  { nama: "Supono", mapel: "PAI dan PKN", foto: "/guru/supono.jpg" },
];