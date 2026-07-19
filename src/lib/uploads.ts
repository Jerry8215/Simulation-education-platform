import 'server-only'

import { db } from '@/lib/db'
import { MIN_WIDTH_INFOGRAPHIC, readImageWidth } from '@/lib/image-size'
import { MAX_BYTES, tooBigMessage } from '@/lib/upload-limits'

export { MIN_WIDTH_INFOGRAPHIC, readImageWidth, MAX_BYTES }

/**
 * Imágenes subidas desde el panel: portadas de talleres, gráficas de preguntas.
 *
 * El nombre del archivo es la llave. El administrador escribe ese mismo nombre
 * en la columna "imagen" del Excel, y el importador lo resuelve. Así puede subir
 * sus propias imágenes sin depender de nadie.
 */

/** Los formatos que el navegador muestra sin sorpresas. */
const ALLOWED = new Map<string, string[]>([
  ['image/png', ['.png']],
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/webp', ['.webp']],
  ['image/gif', ['.gif']],
])

export type UploadError = { error: string }
export type UploadOk = { id: string; filename: string; warning: string | null }

export async function saveUpload(file: File): Promise<UploadOk | UploadError> {
  if (file.size === 0) return { error: 'El archivo está vacío.' }
  const tooBig = tooBigMessage(file.size)
  if (tooBig) return { error: tooBig }

  const extensions = ALLOWED.get(file.type)
  if (!extensions) {
    return { error: 'Solo se aceptan imágenes PNG, JPG, WEBP o GIF.' }
  }

  const filename = file.name.trim()
  if (!filename) return { error: 'El archivo no tiene nombre.' }
  if (!extensions.some((ext) => filename.toLowerCase().endsWith(ext))) {
    return { error: `El nombre del archivo debería terminar en ${extensions.join(' o ')}.` }
  }

  const existing = await db.upload.findUnique({ where: { filename }, select: { id: true } })
  if (existing) {
    return { error: `Ya hay una imagen llamada "${filename}". Bórrala primero o usa otro nombre.` }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const width = readImageWidth(buffer)

  const upload = await db.upload.create({
    data: { filename, mimeType: file.type, bytes: buffer.length, data: buffer },
    select: { id: true, filename: true },
  })

  const warning =
    width !== null && width < MIN_WIDTH_INFOGRAPHIC
      ? `Ojo: la imagen mide ${width} px de ancho. Si es una infografía o una gráfica con texto, ` +
        `a los estudiantes les costará leerla. Se recomienda al menos ${MIN_WIDTH_INFOGRAPHIC} px.`
      : null

  return { ...upload, warning }
}

export function imageUrl(uploadId: string): string {
  return `/api/imagen/${uploadId}`
}
