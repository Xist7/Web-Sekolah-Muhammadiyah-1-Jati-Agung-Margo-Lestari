/**
 * Kompres gambar di browser sebelum diunggah supaya hemat ruang database:
 * diperkecil ke sisi terpanjang `maxSide` px lalu diubah ke JPEG dengan kualitas `quality` (0–1).
 * File non-gambar (PDF) dikembalikan apa adanya. Kalau hasil kompres malah lebih besar, pakai file asli.
 */
export async function compressImage(file: File, { quality = 0.6, maxSide = 1600 } = {}): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // latar putih untuk PNG transparan
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
