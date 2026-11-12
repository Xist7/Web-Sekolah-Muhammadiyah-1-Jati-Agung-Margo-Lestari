import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Model caching klasik: halaman publik di-prerender, diperbarui lewat revalidatePath() setelah admin menyimpan
  cacheComponents: false,
  partialPrefetching: false,
  experimental: {
    // Formulir PPDB mengirim pas foto + SKL (masing-masing maks. 2 MB setelah kompres) lewat Server Action.
    // Jangan > 4.5mb: batas body request di Vercel.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
