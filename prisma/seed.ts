import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await db.schoolProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "SMP Muhammadiyah 1 Jati Agung",
      tagline: "Sekolah Islami, berkemajuan, dan berakhlak mulia",
      about:
        "SMP Muhammadiyah 1 Jati Agung adalah sekolah menengah pertama swasta di bawah naungan Persyarikatan Muhammadiyah di Desa Margo Lestari, Kec. Jati Agung, Kab. Lampung Selatan.",
      vision: "(isi visi sekolah)",
      mission: "(misi 1)\n(misi 2)\n(misi 3)",
      address: "Jl. Hadi Subroto, Margo Lestari, Kec. Jati Agung, Kab. Lampung Selatan, Lampung",
      whatsapp: "6281272004560",
      studentCount: 190,
      classCount: 5,
    },
  });

  await db.ppdbInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      isOpen: true,
      academicYear: "2027/2028",
      schedule: "Pendaftaran: (tanggal)\nTes/wawancara: (tanggal)\nPengumuman: (tanggal)",
      requirements: "Fotokopi ijazah/SKL SD/MI\nFotokopi akta kelahiran\nFotokopi Kartu Keluarga\nPas foto 3x4 (3 lembar)",
      flow: "Isi formulir online\nSekolah menghubungi via WhatsApp\nDaftar ulang & serahkan berkas",
      fees: "(rincian biaya)",
    },
  });
}

main()
  .then(() => console.log("Seed selesai"))
  .finally(() => db.$disconnect());
