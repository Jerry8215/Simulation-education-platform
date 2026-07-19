'use server'

import { revalidatePath } from 'next/cache'

import { createCodes } from '@/lib/access-codes'
import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'

export type GenerateState = { codes: string[]; error: string | null }

export async function generateCodesAction(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  await requireAdmin()

  const count = Number(formData.get('count') ?? 1)
  const note = String(formData.get('note') ?? '').trim()

  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return { codes: [], error: 'Genera entre 1 y 100 códigos a la vez.' }
  }

  const codes = await createCodes(count, note)
  revalidatePath('/admin/codigos')
  return { codes, error: null }
}

/** Borra un código que todavía no se ha usado (por ejemplo, uno mal entregado). */
export async function deleteCodeAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return

  // Un código ya usado no se borra: dejaría al estudiante sin rastro de su acceso.
  await db.accessCode.deleteMany({ where: { id, usedAt: null } })
  revalidatePath('/admin/codigos')
}
