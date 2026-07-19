import { db } from '@/lib/db'

/**
 * Sirve una imagen por su NOMBRE de archivo, el mismo que el administrador
 * escribe en la columna "imagen" del Excel.
 *
 * POR QUÉ POR NOMBRE Y NO POR ID
 *
 * Antes, al cargar las preguntas se resolvía el nombre a un id. Eso obligaba a
 * subir las imágenes ANTES de cargar el Excel: si se hacía al revés, la pregunta
 * quedaba apuntando a un archivo inexistente y había que volver a cargarla.
 *
 * Resolviendo el nombre al mostrar la imagen, el orden deja de importar. El
 * cliente sube el Excel y las imágenes cuando quiera, y en cuanto la imagen
 * existe, aparece.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  const upload = await db.upload.findUnique({
    where: { filename: decodeURIComponent(filename) },
    select: { id: true, data: true, mimeType: true, bytes: true },
  })

  if (!upload) return new Response('Imagen no subida todavía', { status: 404 })

  return new Response(new Uint8Array(upload.data), {
    headers: {
      'Content-Type': upload.mimeType,
      'Content-Length': String(upload.bytes),
      // El nombre puede apuntar a otro contenido si se reemplaza la imagen, así
      // que se revalida. El ETag evita volver a descargarla si no cambió.
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      ETag: `"${upload.id}"`,
    },
  })
}
