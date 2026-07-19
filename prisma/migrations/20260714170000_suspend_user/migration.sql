-- Suspender el acceso de un estudiante (por mal uso). Reversible.
ALTER TABLE "User" ADD COLUMN "suspended" BOOLEAN NOT NULL DEFAULT false;
