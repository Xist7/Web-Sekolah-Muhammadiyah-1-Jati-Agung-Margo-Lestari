"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import type { ActionResult } from "./actions";
import { requireAdmin, UnauthorizedError } from "./guard";

const STATUS_LABEL = { PENDING: "Menunggu", ACCEPTED: "Diterima", REJECTED: "Ditolak" } as const;

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
  notes: z.string().trim().max(2000, "Catatan maks. 2000 karakter").default(""),
});

const fail = (e: unknown): ActionResult => {
  if (e instanceof UnauthorizedError) return { ok: false, message: e.message };
  console.error("[pendaftar]", e);
  return { ok: false, message: "Terjadi kesalahan server. Coba lagi." };
};

/** Ubah status (Menunggu/Diterima/Ditolak) + catatan panitia. */
export async function updatePendaftar(input: z.input<typeof updateSchema>): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    const p = updateSchema.safeParse(input);
    if (!p.success) return { ok: false, message: p.error.issues[0]?.message ?? "Isian tidak valid." };
    const before = await db.registration.findUnique({ where: { id: p.data.id }, select: { status: true, fullName: true, regNumber: true } });
    if (!before) return { ok: false, message: "Pendaftar tidak ditemukan (mungkin sudah dihapus)." };
    await db.registration.update({ where: { id: p.data.id }, data: { status: p.data.status, notes: p.data.notes } });
    const changed = before.status !== p.data.status;
    await logAudit(
      me,
      "UPDATE",
      changed ? `mengubah status pendaftar menjadi ${STATUS_LABEL[p.data.status]}` : "memperbarui catatan pendaftar",
      `${before.regNumber} · ${before.fullName}`,
    );
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: changed ? `Status diubah menjadi ${STATUS_LABEL[p.data.status]}.` : "Catatan disimpan." };
  } catch (e) {
    return fail(e);
  }
}

/** Hapus pendaftar beserta file pas foto & SKL-nya (hemat ruang database). */
export async function deletePendaftar(id: string): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    const reg = await db.registration.findUnique({ where: { id }, select: { regNumber: true, fullName: true, photoId: true, sklId: true } });
    if (!reg) return { ok: false, message: "Pendaftar tidak ditemukan (mungkin sudah dihapus)." };
    const fileIds = [reg.photoId, reg.sklId].filter((x): x is string => !!x);
    await db.$transaction([
      db.registration.delete({ where: { id } }),
      db.upload.deleteMany({ where: { id: { in: fileIds }, isPublic: false } }),
    ]);
    await logAudit(me, "DELETE", "menghapus data pendaftar", `${reg.regNumber} · ${reg.fullName}`);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/ppdb");
    return { ok: true, message: "Data pendaftar dihapus." };
  } catch (e) {
    return fail(e);
  }
}
