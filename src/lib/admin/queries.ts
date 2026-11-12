import type { Prisma, RegistrationStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "./guard";

export async function getDashboardStats() {
  await requireAdmin();
  const [grouped, latest, profile, ppdb] = await Promise.all([
    db.registration.groupBy({ by: ["status"], _count: { _all: true } }),
    db.registration.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.schoolProfile.findUnique({ where: { id: 1 }, select: { studentCount: true, classCount: true } }),
    db.ppdbInfo.findUnique({ where: { id: 1 }, select: { isOpen: true, academicYear: true } }),
  ]);
  const byStatus: Record<RegistrationStatus, number> = { PENDING: 0, ACCEPTED: 0, REJECTED: 0 };
  for (const g of grouped) byStatus[g.status] = g._count._all;
  const total = byStatus.PENDING + byStatus.ACCEPTED + byStatus.REJECTED;
  return { total, byStatus, latest, profile, ppdb };
}

const PAGE_SIZE = 20;

/** F-12: daftar pendaftar dengan filter status, pencarian, dan pagination. */
export async function listRegistrations(opts: { status?: RegistrationStatus; q?: string; page?: number } = {}) {
  await requireAdmin();
  const page = Math.max(1, opts.page ?? 1);
  const q = opts.q?.trim();
  const where: Prisma.RegistrationWhereInput = {
    ...(opts.status && { status: opts.status }),
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { regNumber: { contains: q, mode: "insensitive" } },
        { nisn: { contains: q } },
        { previousSchool: { contains: q, mode: "insensitive" } },
        { parentName: { contains: q, mode: "insensitive" } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    db.registration.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.registration.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getRegistration(id: string) {
  await requireAdmin();
  return db.registration.findUnique({ where: { id } });
}

export async function getSchoolProfile() {
  await requireAdmin();
  return db.schoolProfile.findUnique({ where: { id: 1 } });
}

export async function getPpdbInfo() {
  await requireAdmin();
  return db.ppdbInfo.findUnique({ where: { id: 1 } });
}

export async function listTeachers() {
  await requireAdmin();
  return db.teacher.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
}

export async function listFacilities() {
  await requireAdmin();
  return db.facility.findMany({ orderBy: { createdAt: "asc" } });
}

export async function listGallery() {
  await requireAdmin();
  return db.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
}
