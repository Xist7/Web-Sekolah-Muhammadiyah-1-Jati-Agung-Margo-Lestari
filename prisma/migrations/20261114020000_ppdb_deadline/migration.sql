-- Batas waktu pendaftaran PPDB (otomatis tutup setelah lewat)
ALTER TABLE "PpdbInfo" ADD COLUMN "closesAt" TIMESTAMP(3);
ALTER TABLE "PpdbInfo" ADD COLUMN "closesAtTime" BOOLEAN NOT NULL DEFAULT false;
