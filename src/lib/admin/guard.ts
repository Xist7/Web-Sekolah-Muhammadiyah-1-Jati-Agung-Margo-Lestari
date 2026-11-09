import { auth, isAdminEmail } from "@/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Tidak punya akses. Silakan login sebagai admin.");
  }
}

/** Wajib dipanggil di awal setiap server action / query admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) throw new UnauthorizedError();
  return session.user;
}
