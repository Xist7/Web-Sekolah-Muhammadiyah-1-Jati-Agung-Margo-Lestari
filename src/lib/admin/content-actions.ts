"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contentDefaults, isContentKey } from "@/lib/content/defaults";
import { conform } from "@/lib/content/shape";
import { requireAdmin, UnauthorizedError } from "./guard";
import type { ActionResult } from "./actions";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE = 3 * 1024 * 1024; // setelah dikompres di browser biasanya < 500 KB

const fail = (e: unknown): ActionResult => {
  if (e instanceof UnauthorizedError) return { ok: false, message: e.message };
  console.error("[content action]", e);
  return { ok: false, message: "Terjadi kesalahan server. Coba lagi." };
};

/** Simpan seluruh isi satu bagian konten (header / home / ppdb / footer). */
export async function saveContent(key: string, json: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isContentKey(key)) return { ok: false, message: "Bagian konten tidak dikenal." };
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      return { ok: false, message: "Data konten tidak valid." };
    }
    const data = conform(raw, contentDefaults[key]);
    await db.siteContent.upsert({ where: { key }, create: { key, data }, update: { data } });
    revalidatePath("/", "layout");
    return { ok: true, message: "Konten disimpan & langsung tampil di website." };
  } catch (e) {
    return fail(e);
  }
}

/** Kembalikan satu bagian ke isi bawaan. */
export async function resetContent(key: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isContentKey(key)) return { ok: false, message: "Bagian konten tidak dikenal." };
    await db.siteContent.deleteMany({ where: { key } });
    revalidatePath("/", "layout");
    return { ok: true, message: "Konten dikembalikan ke isi bawaan." };
  } catch (e) {
    return fail(e);
  }
}

/** Unggah gambar konten (publik). Mengembalikan URL /api/files/{id}. */
export async function uploadImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Pilih file gambar." };
    if (!IMAGE_TYPES.includes(file.type)) return { ok: false, message: "Format harus JPG, PNG, WEBP, atau GIF." };
    if (file.size > MAX_IMAGE) return { ok: false, message: "Gambar terlalu besar (maks. 3 MB)." };
    const up = await db.upload.create({
      data: {
        filename: file.name.slice(0, 200),
        mime: file.type,
        size: file.size,
        isPublic: true,
        data: new Uint8Array(await file.arrayBuffer()),
      },
      select: { id: true },
    });
    return { ok: true, url: `/api/files/${up.id}` };
  } catch (e) {
    const r = fail(e);
    return { ok: false, message: r.message };
  }
}

/** Buka / tutup pendaftaran PPDB. */
export async function setPpdbOpen(open: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.ppdbInfo.upsert({ where: { id: 1 }, create: { id: 1, isOpen: open }, update: { isOpen: open } });
    revalidatePath("/", "layout");
    return { ok: true, message: open ? "Pendaftaran DIBUKA." : "Pendaftaran DITUTUP." };
  } catch (e) {
    return fail(e);
  }
}
