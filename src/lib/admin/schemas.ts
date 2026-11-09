import { z } from "zod";

const text = (max = 200) => z.string().trim().max(max);
const required = (label: string, max = 200) => text(max).min(1, `${label} wajib diisi`);
const longText = text(10_000);
const optionalUrl = z.union([z.literal(""), z.url("URL tidak valid")]).default("");
const count = z.coerce.number().int("Harus bilangan bulat").min(0, "Tidak boleh negatif");
// Checkbox HTML: terkirim "on" kalau dicentang, tidak terkirim sama sekali kalau tidak
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const idSchema = z.object({ id: z.string().min(1, "ID tidak valid") });

// F-09, F-13, F-14
export const schoolProfileSchema = z.object({
  name: required("Nama sekolah"),
  tagline: text(),
  about: longText,
  history: longText,
  vision: longText,
  mission: longText,
  address: text(500),
  phone: text(30),
  whatsapp: z.string().trim().regex(/^(62\d{8,13})?$/, "Format WhatsApp: 62812xxxx"),
  email: z.union([z.literal(""), z.email("Email tidak valid")]),
  mapEmbedUrl: optionalUrl,
  studentCount: count,
  classCount: count,
});

export const studentCountSchema = z.object({ studentCount: count, classCount: count });

// F-09
export const facilitySchema = z.object({
  name: required("Nama fasilitas"),
  description: text(2000),
  imageUrl: optionalUrl,
});

// F-10
export const teacherSchema = z.object({
  name: required("Nama"),
  position: required("Jabatan"),
  subject: text(),
  photoUrl: optionalUrl,
  order: count.default(0),
});

// F-11
export const ppdbInfoSchema = z.object({
  isOpen: checkbox,
  academicYear: z.string().trim().regex(/^(\d{4}\/\d{4})?$/, "Format tahun ajaran: 2026/2027"),
  schedule: longText,
  requirements: longText,
  flow: longText,
  fees: longText,
});

// F-12
export const registrationStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);
export const registrationUpdateSchema = z.object({
  id: z.string().min(1),
  status: registrationStatusSchema,
  notes: text(2000).default(""),
});

// F-15
export const galleryItemSchema = z.object({
  title: required("Judul"),
  description: text(2000),
  imageUrl: z.url("URL gambar wajib & harus valid"),
});
