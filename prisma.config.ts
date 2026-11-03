import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrasi butuh koneksi langsung (non-pooled) ke Neon
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
