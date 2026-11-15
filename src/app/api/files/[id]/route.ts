import type { NextRequest } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/guard";
import { db } from "@/lib/db";

/** Sajikan file dari tabel Upload. Berkas pendaftar (isPublic=false) hanya untuk admin. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/files/[id]">) {
  const { id } = await ctx.params;
  const file = await db.upload.findUnique({ where: { id } });
  if (!file) return new Response("Not found", { status: 404 });

  if (!file.isPublic) {
    if (!(await getCurrentAdmin())) return new Response("Forbidden", { status: 403 });
  }

  return new Response(Buffer.from(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "X-Content-Type-Options": "nosniff",
      // id file tidak pernah berubah isinya → aman di-cache lama (yang privat hanya di browser admin)
      "Cache-Control": file.isPublic ? "public, max-age=31536000, immutable" : "private, max-age=3600",
    },
  });
}
