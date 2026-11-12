-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "regNumber" TEXT,
ADD COLUMN "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN "parentRelation" TEXT NOT NULL DEFAULT '',
ADD COLUMN "parentJob" TEXT NOT NULL DEFAULT '',
ADD COLUMN "program" TEXT NOT NULL DEFAULT '',
ADD COLUMN "infoSource" TEXT NOT NULL DEFAULT '',
ADD COLUMN "photoId" TEXT,
ADD COLUMN "sklId" TEXT;

-- Isi nomor untuk baris lama (kalau ada) lalu jadikan wajib & unik
UPDATE "Registration" SET "regNumber" = 'PPDB-LAMA-' || "id" WHERE "regNumber" IS NULL;
ALTER TABLE "Registration" ALTER COLUMN "regNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Registration_regNumber_key" ON "Registration"("regNumber");

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);
