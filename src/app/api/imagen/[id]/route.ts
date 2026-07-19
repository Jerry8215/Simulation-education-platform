import { db } from '@/lib/db'

/**
 * Sirve una imagen subida desde el panel.
 *
 * El contenido de un id nunca cambia —al reemplazar una imagen se crea otra—,
 * así que se puede cachear para siempre. Sin eso, cada estudiante que abre una
 * pregunta con gráfica golpearía la base.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const upload = await db.upload.findUnique({
    where: { id },
    select: { data: true, mimeType: true, bytes: true },
  })

  if (!upload) return new Response('Imagen no encontrada', { status: 404 })

  return new Response(new Uint8Array(upload.data), {
    headers: {
      'Content-Type': upload.mimeType,
      'Content-Length': String(upload.bytes),
      // Inmutable: el id identifica este contenido y solo este.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
