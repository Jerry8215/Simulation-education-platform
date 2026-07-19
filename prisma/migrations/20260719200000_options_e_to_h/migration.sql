-- Hasta 8 opciones (A-H) para el formato de emparejamiento del ICFES de inglés.
ALTER TYPE "Option" ADD VALUE IF NOT EXISTS 'E';
ALTER TYPE "Option" ADD VALUE IF NOT EXISTS 'F';
ALTER TYPE "Option" ADD VALUE IF NOT EXISTS 'G';
ALTER TYPE "Option" ADD VALUE IF NOT EXISTS 'H';

ALTER TABLE "QuestionVersion" ADD COLUMN "optionE" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionF" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionG" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionH" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionEImageUrl" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionFImageUrl" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionGImageUrl" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionHImageUrl" TEXT;
