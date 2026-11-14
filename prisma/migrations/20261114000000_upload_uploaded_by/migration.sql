-- Catat siapa yang mengunggah gambar media
ALTER TABLE "Upload" ADD COLUMN "uploadedBy" TEXT NOT NULL DEFAULT '';
