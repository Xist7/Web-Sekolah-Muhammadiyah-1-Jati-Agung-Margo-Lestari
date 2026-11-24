import "server-only";

export type Role = "SUPERADMIN" | "ADMIN";

/**
 * Superadmin = pemilik panel. Hanya SATU orang, ditentukan lewat env SUPERADMIN_EMAIL
 * (bukan lewat panel), jadi tidak ada admin yang bisa menonaktifkan, menghapus, atau menggantikannya.
 * Kalau env berisi beberapa email, hanya yang pertama yang dipakai.
 */
export const superadminEmail = (process.env.SUPERADMIN_EMAIL ?? "").split(",")[0].trim().toLowerCase();

export const isSuperadmin = (email: string) => superadminEmail !== "" && email.trim().toLowerCase() === superadminEmail;

export const roleOf = (email: string): Role => (isSuperadmin(email) ? "SUPERADMIN" : "ADMIN");
