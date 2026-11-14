import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/** Maks. percobaan kirim per IP dalam jendela waktu. Sekolah/warnet bisa berbagi IP, jadi jangan terlalu ketat. */
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 jam
/** Formulir yang dikirim kurang dari ini sejak dibuka hampir pasti bot. */
export const MIN_FILL_MS = 5_000;

export async function clientIp() {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

const hashIp = (ip: string) =>
  createHash("sha256").update(`${ip}|${process.env.AUTH_SECRET ?? process.env.DATABASE_URL ?? ""}`).digest("hex");

/** Catat percobaan & kembalikan false kalau IP ini sudah melewati batas. */
export async function allowAttempt(ip: string) {
  const ipHash = hashIp(ip);
  const since = new Date(Date.now() - WINDOW_MS);
  const count = await db.submitAttempt.count({ where: { ipHash, createdAt: { gte: since } } });
  if (count >= MAX_ATTEMPTS) return false;
  await db.submitAttempt.create({ data: { ipHash } });
  // Bersihkan catatan lama sesekali supaya tabel tidak membengkak
  if (Math.random() < 0.05) {
    await db.submitAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * WINDOW_MS) } } }).catch(() => {});
  }
  return true;
}

/** Verifikasi Cloudflare Turnstile. Kalau TURNSTILE_SECRET_KEY belum diisi, pemeriksaan dilewati. */
export async function verifyTurnstile(token: string | null, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (e) {
    console.error("[turnstile]", e);
    return false;
  }
}
