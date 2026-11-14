-- Anti pendaftaran massal PPDB: pembatasan per IP + pencarian NISN dobel
CREATE TABLE "SubmitAttempt" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubmitAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SubmitAttempt_ipHash_createdAt_idx" ON "SubmitAttempt"("ipHash", "createdAt");
CREATE INDEX "Registration_nisn_idx" ON "Registration"("nisn");
