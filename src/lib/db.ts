import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const create = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/**
 * Dev: client disimpan di globalThis agar hot reload tidak membuka koneksi baru terus.
 * Tapi setelah `prisma generate` (model baru), client lama di cache tidak mengenal model itu
 * → "Cannot read properties of undefined (reading 'findMany')". Jadi buat ulang bila ada model yang hilang.
 */
function getClient() {
  const cached = globalForPrisma.prisma;
  if (!cached) return create();
  const stale = Object.values(Prisma.ModelName).some((m) => !(m.charAt(0).toLowerCase() + m.slice(1) in cached));
  if (stale) {
    void cached.$disconnect().catch(() => {});
    return create();
  }
  return cached;
}

export const db = getClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
