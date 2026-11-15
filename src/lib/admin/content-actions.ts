"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { contentDefaults, isContentKey, sections } from "@/lib/content/defaults";
import { conform } from "@/lib/content/shape";
import { requireAdmin, UnauthorizedError } from "./guard";
import type { ActionResult } from "./actions";
import { formatDeadline, parseDeadline } from "@/lib/ppdb/deadline";

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
    const me = await requireAdmin();
    if (!isContentKey(key)) return { ok: false, message: "Bagian konten tidak dikenal." };
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      return { ok: false, message: "Data konten tidak valid." };
    }
    const data = conform(raw, contentDefaults[key]) as Record<string, unknown>;
    // Penanda "pemimpin" (mis. kepala sekolah) hanya boleh 1 per daftar
    for (const f of sections[key].fields) {
      if (f.type !== "list" || !f.leader) continue;
      let seen = false;
      for (const item of (data[f.k] as Record<string, unknown>[]) ?? []) {
        if (item[f.leader.key] === true) {
          if (seen) item[f.leader.key] = false;
          seen = true;
        }
      }
    }
    await db.siteContent.upsert({ where: { key }, create: { key, data: data as object }, update: { data: data as object } });
    revalidatePath("/", "layout");
    await logAudit(me, "UPDATE", `mengubah konten ${sections[key].label}`, sections[key].label);
    return { ok: true, message: "Konten disimpan & langsung tampil di website." };
  } catch (e) {
    return fail(e);
  }
}

/** Kembalikan satu bagian ke isi bawaan. */
export async function resetContent(key: string): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    if (!isContentKey(key)) return { ok: false, message: "Bagian konten tidak dikenal." };
    await db.siteContent.deleteMany({ where: { key } });
    revalidatePath("/", "layout");
    await logAudit(me, "UPDATE", `mengembalikan konten ${sections[key].label} ke isi bawaan`, sections[key].label);
    return { ok: true, message: "Konten dikembalikan ke isi bawaan." };
  } catch (e) {
    return fail(e);
  }
}

/** Unggah gambar konten (publik). Mengembalikan URL /api/files/{id}. */
export async function uploadImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    const me = await requireAdmin();
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
        uploadedBy: (me.name || me.email).slice(0, 120),
        data: new Uint8Array(await file.arrayBuffer()),
      },
      select: { id: true },
    });
    await logAudit(me, "UPLOAD", "mengunggah gambar ke media", file.name);
    return { ok: true, url: `/api/files/${up.id}` };
  } catch (e) {
    const r = fail(e);
    return { ok: false, message: r.message };
  }
}

/**
 * Buka / tutup pendaftaran PPDB.
 * Saat membuka wajib ada tanggal tutup (YYYY-MM-DD); jam (HH:MM) opsional.
 * Tanpa jam = tutup setelah tanggal itu berakhir. Lewat batas = otomatis tutup (lihat lib/ppdb/deadline).
 */
export async function setPpdbOpen(open: boolean, until?: { date: string; time?: string }): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    if (!open) {
      await db.ppdbInfo.upsert({ where: { id: 1 }, create: { id: 1, isOpen: false }, update: { isOpen: false, closesAt: null, closesAtTime: false } });
      revalidatePath("/", "layout");
      await logAudit(me, "CLOSE", "menutup pendaftaran PPDB", "PPDB");
      return { ok: true, message: "Pendaftaran DITUTUP." };
    }
    const time = until?.time?.trim() || "";
    const closesAt = until ? parseDeadline(until.date, time) : null;
    if (!closesAt) return { ok: false, message: "Isi tanggal ditutupnya pendaftaran." };
    if (closesAt <= new Date()) return { ok: false, message: "Batas pendaftaran harus setelah waktu sekarang." };
    const data = { isOpen: true, closesAt, closesAtTime: !!time };
    await db.ppdbInfo.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
    revalidatePath("/", "layout");
    const label = formatDeadline(closesAt, !!time);
    await logAudit(me, "OPEN", `membuka pendaftaran PPDB sampai ${label}`, "PPDB");
    return { ok: true, message: `Pendaftaran DIBUKA sampai ${label}.` };
  } catch (e) {
    return fail(e);
  }
}

// ── Pustaka media (gambar website) ──
export type MediaItem = { id: string; url: string; filename: string; size: number; createdAt: string; uploadedBy: string };

/** Daftar gambar publik terbaru (tanpa mengambil isi file, supaya cepat). */
export async function listMedia(): Promise<MediaItem[]> {
  await requireAdmin();
  const rows = await db.upload.findMany({
    where: { isPublic: true, mime: { startsWith: "image/" } },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: { id: true, filename: true, size: true, createdAt: true, uploadedBy: true },
  });
  return rows.map((r) => ({ id: r.id, url: `/api/files/${r.id}`, filename: r.filename, size: r.size, createdAt: r.createdAt.toISOString(), uploadedBy: r.uploadedBy }));
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    const del = await db.upload.delete({ where: { id, isPublic: true }, select: { filename: true } });
    await logAudit(me, "DELETE", "menghapus gambar dari media", del.filename);
    revalidatePath("/dashboard/media");
    return { ok: true, message: "Gambar dihapus dari media." };
  } catch (e) {
    return fail(e);
  }
}
