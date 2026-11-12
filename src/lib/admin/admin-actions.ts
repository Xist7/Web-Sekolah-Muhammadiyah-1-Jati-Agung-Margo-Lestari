"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import type { ActionResult } from "./actions";
import { requireAdmin, UnauthorizedError } from "./guard";

const emailSchema = z.email("Email tidak valid").trim().toLowerCase().max(200);

async function run(fn: (me: { email: string; name?: string | null }) => Promise<ActionResult>): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    const r = await fn(me);
    if (r.ok) revalidatePath("/dashboard/admin");
    return r;
  } catch (e) {
    if (e instanceof UnauthorizedError) return { ok: false, message: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return { ok: false, message: "Email ini sudah terdaftar." };
      if (e.code === "P2025") return { ok: false, message: "Admin tidak ditemukan." };
    }
    console.error("[admin-actions]", e);
    return { ok: false, message: "Terjadi kesalahan server. Coba lagi." };
  }
}

export async function addAdmin(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return run(async (me) => {
    const p = emailSchema.safeParse(formData.get("email"));
    if (!p.success) return { ok: false, message: p.error.issues[0]?.message ?? "Email tidak valid." };
    await db.admin.create({ data: { email: p.data, createdBy: me.email } });
    await logAudit(me, "CREATE", "menambahkan admin baru", p.data);
    return { ok: true, message: `${p.data} ditambahkan sebagai admin.` };
  });
}

/** Aktifkan / nonaktifkan admin. */
export async function setAdminActive(id: string, isActive: boolean): Promise<ActionResult> {
  return run(async (me) => {
    const target = await db.admin.findUniqueOrThrow({ where: { id } });
    if (target.email === me.email && !isActive) return { ok: false, message: "Tidak bisa menonaktifkan akun sendiri." };
    await db.admin.update({ where: { id }, data: { isActive } });
    await logAudit(me, "UPDATE", isActive ? "mengaktifkan admin" : "menonaktifkan admin", target.email);
    return { ok: true, message: `${target.email} ${isActive ? "diaktifkan" : "dinonaktifkan"}.` };
  });
}

export async function deleteAdmin(id: string): Promise<ActionResult> {
  return run(async (me) => {
    const target = await db.admin.findUniqueOrThrow({ where: { id } });
    if (target.email === me.email) return { ok: false, message: "Tidak bisa menghapus akun sendiri." };
    await db.admin.delete({ where: { id } });
    await logAudit(me, "DELETE", "menghapus admin", target.email);
    return { ok: true, message: `${target.email} dihapus dari daftar admin.` };
  });
}
