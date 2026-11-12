"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "./guard";
import {
  facilitySchema,
  galleryItemSchema,
  idSchema,
  ppdbInfoSchema,
  registrationUpdateSchema,
  schoolProfileSchema,
  studentCountSchema,
  teacherSchema,
} from "./schemas";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

/**
 * Bungkus semua action admin: cek login, validasi FormData, tangani error,
 * lalu refresh cache halaman publik + dashboard.
 * Signature (prevState, formData) supaya bisa langsung dipakai dengan useActionState.
 */
function adminAction<S extends z.ZodType>(
  schema: S,
  run: (data: z.infer<S>) => Promise<unknown>,
  successMessage: string,
) {
  return async (_prev: ActionResult | null, formData: FormData): Promise<ActionResult> => {
    try {
      await requireAdmin();
      const parsed = schema.safeParse(Object.fromEntries(formData));
      if (!parsed.success) {
        return {
          ok: false,
          message: "Periksa kembali isian formulir.",
          fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>,
        };
      }
      await run(parsed.data);
      revalidatePath("/", "layout");
      return { ok: true, message: successMessage };
    } catch (e) {
      if (e instanceof UnauthorizedError) return { ok: false, message: e.message };
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return { ok: false, message: "Data tidak ditemukan (mungkin sudah dihapus)." };
      }
      console.error("[admin action]", e);
      return { ok: false, message: "Terjadi kesalahan server. Coba lagi." };
    }
  };
}

// ── F-09 / F-13 / F-14: profil sekolah, kontak, jumlah siswa ──
export const updateSchoolProfile = adminAction(
  schoolProfileSchema,
  (data) => db.schoolProfile.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data }),
  "Profil sekolah disimpan.",
);

export const updateStudentCount = adminAction(
  studentCountSchema,
  (data) => db.schoolProfile.update({ where: { id: 1 }, data }),
  "Jumlah siswa diperbarui.",
);

// ── F-09: fasilitas ──
export const createFacility = adminAction(facilitySchema, (data) => db.facility.create({ data }), "Fasilitas ditambahkan.");
export const updateFacility = adminAction(
  facilitySchema.extend(idSchema.shape),
  ({ id, ...data }) => db.facility.update({ where: { id }, data }),
  "Fasilitas diperbarui.",
);
export const deleteFacility = adminAction(idSchema, ({ id }) => db.facility.delete({ where: { id } }), "Fasilitas dihapus.");

// ── F-10: guru & tendik ──
export const createTeacher = adminAction(teacherSchema, (data) => db.teacher.create({ data }), "Data guru ditambahkan.");
export const updateTeacher = adminAction(
  teacherSchema.extend(idSchema.shape),
  ({ id, ...data }) => db.teacher.update({ where: { id }, data }),
  "Data guru diperbarui.",
);
export const deleteTeacher = adminAction(idSchema, ({ id }) => db.teacher.delete({ where: { id } }), "Data guru dihapus.");

// ── F-11: informasi PPDB ──
export const updatePpdbInfo = adminAction(
  ppdbInfoSchema,
  (data) => db.ppdbInfo.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data }),
  "Informasi PPDB disimpan.",
);

// ── F-12: kelola pendaftar ──
export const updateRegistration = adminAction(
  registrationUpdateSchema,
  ({ id, ...data }) => db.registration.update({ where: { id }, data }),
  "Data pendaftar diperbarui.",
);
export const deleteRegistration = adminAction(
  idSchema,
  ({ id }) => db.registration.delete({ where: { id } }),
  "Data pendaftar dihapus.",
);

// ── F-15: galeri ──
export const createGalleryItem = adminAction(
  galleryItemSchema,
  (data) => db.galleryItem.create({ data }),
  "Foto galeri ditambahkan.",
);
export const updateGalleryItem = adminAction(
  galleryItemSchema.extend(idSchema.shape),
  ({ id, ...data }) => db.galleryItem.update({ where: { id }, data }),
  "Foto galeri diperbarui.",
);
export const deleteGalleryItem = adminAction(
  idSchema,
  ({ id }) => db.galleryItem.delete({ where: { id } }),
  "Foto galeri dihapus.",
);
