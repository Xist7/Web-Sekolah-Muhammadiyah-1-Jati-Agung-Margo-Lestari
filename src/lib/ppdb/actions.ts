"use server";

import { isPpdbOpen } from "@/lib/ppdb/deadline";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { allowAttempt, clientIp, MIN_FILL_MS, verifyTurnstile } from "./antispam";

export type SubmitResult =
  | { ok: true; regNumber: string; name: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

const t = (label: string, min = 1, max = 200) =>
  z.string().trim().min(min, `${label} wajib diisi`).max(max, `${label} terlalu panjang`);

const schema = z.object({
  nisn: z.string().trim().regex(/^\d{10}$/, "NISN harus 10 digit angka"),
  nama: t("Nama", 3),
  jk: z.enum(["L", "P"], "Pilih jenis kelamin"),
  sd: t("Asal sekolah"),
  tempat: t("Tempat lahir"),
  tgl: z.iso.date("Tanggal lahir tidak valid"),
  email: z.email("Email tidak valid").max(200),
  ortu: t("Nama orang tua"),
  hub: t("Hubungan"),
  wa: z.string().trim().regex(/^(\+62|62|0)8\d{8,12}$/, "Nomor WhatsApp tidak valid"),
  kerja: z.string().trim().max(100).default(""),
  jalan: t("Jalan / dusun", 3),
  rt: z.string().trim().regex(/^\d{1,3}$/, "RT harus angka"),
  rw: z.string().trim().regex(/^\d{1,3}$/, "RW harus angka"),
  desa: t("Desa / kelurahan"),
  kec: t("Kecamatan"),
  kab: t("Kabupaten / kota"),
  infoLain: z.string().trim().max(200).default(""),
});

// Gambar sudah dikompres di browser (JPEG ~60%); PDF tidak bisa dikompres, jadi dibatasi.
const FILE_RULES = {
  foto: { types: ["image/jpeg", "image/png", "image/webp"], max: 2 * 1024 * 1024, label: "Pas foto" },
  skl: { types: ["application/pdf", "image/jpeg", "image/png", "image/webp"], max: 3 * 1024 * 1024, label: "SKL" },
} as const;

function readFile(formData: FormData, key: keyof typeof FILE_RULES) {
  const f = formData.get(key);
  const rule = FILE_RULES[key];
  if (!(f instanceof File) || f.size === 0) return { error: `${rule.label} wajib diunggah.` };
  if (!(rule.types as readonly string[]).includes(f.type)) return { error: `Format ${rule.label} tidak didukung.` };
  if (f.size > rule.max) return { error: `${rule.label} melebihi ${rule.max / 1048576} MB.` };
  return { file: f };
}

/** Cek cepat dari formulir: apakah NISN sudah punya pendaftaran aktif di sekolah ini. */
export async function checkNisn(nisn: string): Promise<{ valid: boolean; registered: boolean }> {
  if (!/^\d{10}$/.test(nisn)) return { valid: false, registered: false };
  const dup = await db.registration.findFirst({
    where: { nisn, status: { not: "REJECTED" } },
    select: { id: true },
  });
  return { valid: true, registered: !!dup };
}

/** F-04: kirim formulir pendaftaran PPDB (publik, tanpa login). */
export async function submitRegistration(formData: FormData): Promise<SubmitResult> {
  try {
    const info = await db.ppdbInfo.findUnique({ where: { id: 1 }, select: { isOpen: true, closesAt: true, closesAtTime: true } });
    if (!isPpdbOpen(info)) return { ok: false, message: "Maaf, pendaftaran sedang ditutup." };

    // --- Anti bot / pendaftaran massal ---
    const BOT = { ok: false as const, message: "Pengiriman ditolak. Muat ulang halaman lalu coba lagi." };
    // Honeypot: kolom tersembunyi yang hanya diisi bot
    if (String(formData.get("website") ?? "") !== "") return BOT;
    // Formulir diisi terlalu cepat sejak halaman dibuka
    const openedAt = Number(formData.get("_t"));
    if (!Number.isFinite(openedAt) || Date.now() - openedAt < MIN_FILL_MS) return BOT;

    const ip = await clientIp();
    if (!(await verifyTurnstile(formData.get("cf-turnstile-response") as string | null, ip))) {
      return { ok: false, message: "Verifikasi keamanan gagal. Selesaikan centang verifikasi lalu kirim ulang." };
    }
    if (!(await allowAttempt(ip))) {
      return { ok: false, message: "Terlalu banyak pengiriman dari jaringan ini. Coba lagi dalam 1 jam atau hubungi panitia PPDB." };
    }

    const fields = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string"));
    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Periksa kembali isian formulir.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>,
      };
    }
    const foto = readFile(formData, "foto");
    const skl = readFile(formData, "skl");
    if (foto.error || skl.error) {
      return { ok: false, message: foto.error ?? skl.error!, fieldErrors: { foto: foto.error ? [foto.error] : undefined, skl: skl.error ? [skl.error] : undefined } };
    }

    const d = parsed.data;

    // Satu NISN hanya boleh punya satu pendaftaran aktif (yang ditolak boleh daftar ulang)
    const dup = await db.registration.findFirst({
      where: { nisn: d.nisn, status: { not: "REJECTED" } },
      select: { id: true },
    });
    if (dup) {
      const msg = "NISN ini sudah terdaftar. Hubungi panitia PPDB jika merasa belum pernah mendaftar.";
      return { ok: false, message: msg, fieldErrors: { nisn: [msg] } };
    }

    const sources = formData.getAll("info").filter((v): v is string => typeof v === "string").map((s) => s.slice(0, 50));
    if (d.infoLain) sources.push(`Lainnya: ${d.infoLain}`);

    const toUpload = async (f: File) =>
      (
        await db.upload.create({
          data: { filename: f.name.slice(0, 200), mime: f.type, size: f.size, isPublic: false, data: new Uint8Array(await f.arrayBuffer()) },
          select: { id: true },
        })
      ).id;
    const [photoId, sklId] = await Promise.all([toUpload(foto.file!), toUpload(skl.file!)]);

    const year = new Date().getFullYear();
    // Nomor urut; ulangi kalau bentrok dengan pendaftar lain yang submit bersamaan
    for (let attempt = 0; attempt < 5; attempt++) {
      const n = (await db.registration.count()) + 1 + attempt;
      const regNumber = `PPDB-${year}-${String(n).padStart(4, "0")}`;
      try {
        await db.registration.create({
          data: {
            regNumber,
            nisn: d.nisn,
            fullName: d.nama,
            gender: d.jk,
            previousSchool: d.sd,
            birthPlace: d.tempat,
            birthDate: new Date(d.tgl),
            email: d.email,
            parentName: d.ortu,
            parentRelation: d.hub,
            parentPhone: d.wa,
            parentJob: d.kerja,
            address: `${d.jalan}, RT ${d.rt.padStart(2, "0")} / RW ${d.rw.padStart(2, "0")}, Desa ${d.desa}, Kec. ${d.kec}, ${d.kab}`,
            infoSource: sources.join(", "),
            photoId,
            sklId,
          },
        });
        revalidatePath("/ppdb");
        return { ok: true, regNumber, name: d.nama };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
        throw e;
      }
    }
    return { ok: false, message: "Server sedang sibuk, silakan kirim ulang." };
  } catch (e) {
    console.error("[ppdb submit]", e);
    return { ok: false, message: "Terjadi kesalahan server. Coba lagi beberapa saat." };
  }
}
