/** Utilitas bentuk konten — aman dipakai di server maupun browser. */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Paksa `value` mengikuti bentuk `template`: key asing dibuang, tipe salah diganti nilai bawaan.
 * Dipakai saat membaca DB (konten lama tetap jalan walau defaults bertambah) dan saat menyimpan (validasi).
 */
export function conform<T>(value: unknown, template: T): T {
  if (typeof template === "string") return (typeof value === "string" ? value.slice(0, 20_000) : template) as T;
  if (typeof template === "number") {
    const n = typeof value === "number" ? value : Number(value);
    return (Number.isFinite(n) ? n : template) as T;
  }
  if (typeof template === "boolean") return (typeof value === "boolean" ? value : template) as T;
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return template;
    // Item contoh dikosongkan dulu: kolom yang hilang jadi ""/false, bukan ikut isi item pertama
    // (mis. kepalaSekolah: true milik guru pertama tidak menular ke semua guru)
    const item = blank(template[0]);
    return value.slice(0, 200).map((v) => conform(v, item)) as T;
  }
  if (isObj(template)) {
    const src = isObj(value) ? value : {};
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(template)) out[k] = conform(k in src ? src[k] : undefined, template[k]);
    return out as T;
  }
  return template;
}

/** Item kosong dengan bentuk sama, untuk tombol "Tambah". */
export function blank<T>(template: T): T {
  if (typeof template === "string") return "" as T;
  if (typeof template === "number") return 0 as T;
  if (typeof template === "boolean") return false as T;
  if (Array.isArray(template)) return [] as T;
  if (isObj(template)) {
    return Object.fromEntries(Object.entries(template).map(([k, v]) => [k, blank(v)])) as T;
  }
  return template;
}
