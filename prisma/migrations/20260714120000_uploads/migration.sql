-- Imágenes subidas desde el panel: portadas de talleres, gráficas de preguntas.
-- Van en la base y no en el disco porque en producción el disco es de solo
-- lectura: un archivo subido desaparecería en el siguiente despliegue.
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Upload_filename_key" ON "Upload"("filename");

-- La portada del taller o simulacro.
ALTER TABLE "Assessment" ADD COLUMN "coverUploadId" TEXT;

ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_coverUploadId_fkey"
  FOREIGN KEY ("coverUploadId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
