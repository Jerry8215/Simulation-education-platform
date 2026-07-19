-- Opciones de respuesta que son imágenes (tablas/gráficas) en vez de texto.
ALTER TABLE "QuestionVersion" ADD COLUMN "optionAImageUrl" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionBImageUrl" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionCImageUrl" TEXT;
ALTER TABLE "QuestionVersion" ADD COLUMN "optionDImageUrl" TEXT;
