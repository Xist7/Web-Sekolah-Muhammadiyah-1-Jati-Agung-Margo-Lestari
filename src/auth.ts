import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cache } from "react";
import { isSuperadmin, roleOf, type Role } from "@/lib/admin/roles";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";

/**
 * Siapa yang boleh masuk panel admin:
 *  1. Email di env SUPERADMIN_EMAIL                        → superadmin, cuma 1, tidak bisa diubah/dihapus siapa pun
 *  2. Email di tabel Admin (Neon) dengan isActive = true  → admin, dikelola di /dashboard/admin
 *  3. Email di env ADMIN_EMAILS                            → admin cadangan (agar tidak terkunci)
 */
export const envAdmins = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export type AdminAccess = { email: string; role: Role };

/** Cek akses admin langsung ke DB (dipanggil tiap request, jadi admin yang dihapus langsung kehilangan akses). */
// cache(): satu query per request walau dipanggil di layout + halaman + action
export const getAdminAccess = cache(async (email?: string | null): Promise<AdminAccess | null> => {
  const e = email?.trim().toLowerCase();
  if (!e) return null;
  const role = roleOf(e);
  // Superadmin selalu punya akses, apa pun isi tabel Admin
  if (role === "SUPERADMIN" || envAdmins.includes(e)) return { email: e, role };
  const admin = await db.admin.findUnique({ where: { email: e }, select: { isActive: true } });
  return admin?.isActive ? { email: e, role } : null;
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/login", error: "/login" },
  // Sesi admin berlaku 8 jam, lalu wajib login ulang
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false;
      // Tolak akun Google yang emailnya belum terverifikasi
      if (!profile?.email || profile.email_verified !== true) return false;
      const access = await getAdminAccess(profile.email);
      if (!access) return false;
      const seen = { lastLoginAt: new Date(), name: profile.name ?? undefined };
      // Superadmin dicatat ke tabel supaya nama & login terakhirnya tampil di daftar admin
      await (isSuperadmin(access.email)
        ? db.admin.upsert({ where: { email: access.email }, update: seen, create: { email: access.email, createdBy: "env", ...seen } })
        : db.admin.update({ where: { email: access.email }, data: seen })
      ).catch(() => {}); // admin dari env mungkin tidak ada di tabel
      await logAudit({ email: access.email, name: profile.name }, "LOGIN", "masuk ke panel admin");
      return true;
    },
  },
  events: {
    async signOut(msg) {
      const t = "token" in msg ? msg.token : null;
      if (t?.email) await logAudit({ email: t.email, name: t.name }, "LOGOUT", "keluar dari panel admin");
    },
  },
});
