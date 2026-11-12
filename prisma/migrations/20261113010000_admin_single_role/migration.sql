-- Sesuai PRD: satu role admin saja
ALTER TABLE "Admin" DROP COLUMN "role";

DROP TYPE "AdminRole";
