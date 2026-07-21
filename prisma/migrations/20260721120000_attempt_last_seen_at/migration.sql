-- Señal de vida del estudiante dentro del examen: el reloj solo consume el
-- tiempo que estuvo presente; la ausencia se le devuelve al volver.
ALTER TABLE "Attempt" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
