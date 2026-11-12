import { redirect } from "next/navigation";
import { auth, getAdminAccess } from "@/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Tidak punya akses. Silakan login sebagai admin.") {
    super(message);
  }
}

/** Wajib dipanggil di awal setiap server action / query admin. Status admin dicek ulang ke DB. */
export async function requireAdmin() {
  const session = await auth();
  const access = await getAdminAccess(session?.user?.email);
  if (!session?.user || !access) throw new UnauthorizedError();
  return { ...session.user, email: access.email };
}

/** Versi tanpa throw, untuk layout / route handler. */
export async function getCurrentAdmin() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

/** Untuk halaman (page.tsx) admin: belum login / bukan admin → diarahkan ke /login (tanpa error di log). */
export async function requireAdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  return admin;
}
