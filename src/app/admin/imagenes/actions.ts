'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'
import { saveUpload } from '@/lib/uploads'

export type UploadState = {
  ok: boolean
  error: string | null
  filename: string | null
  warning: string | null
}

export async function uploadImageAction(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await requireAdmin()

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false, error: 'Elige una imagen.', filename: null, warning: null }
  }

  const result = await saveUpload(file)
  if ('error' in result) {
    return { ok: false, error: result.error, filename: null, warning: null }
  }

  revalidatePath('/admin/imagenes')
  revalidatePath('/admin/simulacros')

  return { ok: true, error: null, filename: result.filename, warning: result.warning }
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return

  // Las preguntas que la usaban quedan sin imagen, y las portadas se ponen en
  // nulo (onDelete: SetNull). No se borra nada más.
  await db.upload.delete({ where: { id } })

  revalidatePath('/admin/imagenes')
  revalidatePath('/admin/simulacros')
}
