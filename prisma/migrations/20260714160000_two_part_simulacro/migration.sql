-- Simulacros en dos partes cronometradas (como las dos sesiones del ICFES real).
ALTER TABLE "Assessment" ADD COLUMN "durationMinutesPart2" INTEGER;
ALTER TABLE "AssessmentQuestion" ADD COLUMN "part" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Attempt" ADD COLUMN "currentPart" INTEGER NOT NULL DEFAULT 1;
