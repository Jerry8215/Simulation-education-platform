-- Solo quien pagó el curso recibe un código, y sin código no hay registro.
CREATE TABLE "AccessCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "usedById" TEXT,

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccessCode_code_key" ON "AccessCode"("code");
CREATE UNIQUE INDEX "AccessCode_usedById_key" ON "AccessCode"("usedById");
CREATE INDEX "AccessCode_usedAt_idx" ON "AccessCode"("usedAt");

ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_usedById_fkey"
  FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
