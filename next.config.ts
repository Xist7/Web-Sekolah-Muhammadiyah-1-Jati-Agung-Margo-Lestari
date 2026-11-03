import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Model caching klasik: halaman publik di-prerender, diperbarui lewat revalidatePath() setelah admin menyimpan
  cacheComponents: false,
  partialPrefetching: false,
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
