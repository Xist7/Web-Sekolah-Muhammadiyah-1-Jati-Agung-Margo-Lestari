/** Batas waktu pendaftaran PPDB. Semua tanggal & jam dalam WIB (Asia/Jakarta, UTC+7). Aman dipakai di server & browser. */

type Info = { isOpen: boolean; closesAt: Date | null; closesAtTime: boolean } | null | undefined;

/** Pendaftaran benar-benar terbuka: dibuka admin DAN belum lewat batas waktu. */
export const isPpdbOpen = (info: Info, now = new Date()) =>
  !!info?.isOpen && (!info.closesAt || now < info.closesAt);

/** Dibuka admin tapi batas waktunya sudah lewat (= tutup otomatis). */
export const isPpdbExpired = (info: Info, now = new Date()) =>
  !!info?.isOpen && !!info.closesAt && now >= info.closesAt;

/**
 * Tanggal (YYYY-MM-DD) + jam opsional (HH:MM) → saat pendaftaran tutup.
 *  - dengan jam  : tepat di jam itu
 *  - tanpa jam   : setelah tanggal itu habis (00.00 hari berikutnya)
 */
export function parseDeadline(date: string, time?: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (time && !/^\d{2}:\d{2}$/.test(time)) return null;
  const d = new Date(`${date}T${time || "00:00"}:00+07:00`);
  if (Number.isNaN(d.getTime())) return null;
  if (!time) d.setTime(d.getTime() + 86_400_000);
  return d;
}

/** "3 Januari 2027" atau "3 Januari 2027 pukul 08.00 WIB" */
export function formatDeadline(closesAt: Date, withTime: boolean) {
  // Tanpa jam: closesAt = 00.00 hari berikutnya, jadi tampilkan tanggal sehari sebelumnya
  const shown = withTime ? closesAt : new Date(closesAt.getTime() - 1);
  const tgl = shown.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
  if (!withTime) return tgl;
  const jam = shown.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  return `${tgl} pukul ${jam} WIB`;
}
