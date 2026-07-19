'use server'

import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/auth/require'
import { AttemptError, startOrResumeAttempt } from '@/lib/attempts'

/**
 * Inicia (o retoma) un simulacro o un taller y lleva al estudiante a la pantalla
 * de examen. Si ya lo terminó, no deja repetirlo (§9) y lo devuelve al listado.
 *
 * `back` dice a qué listado volver si algo falla; por defecto, simulacros.
 */
export async function startSimulacroAction(formData: FormData): Promise<void> {
  const { userId } = await requireUser()

  const assessmentId = String(formData.get('assessmentId') ?? '')
  const back = String(formData.get('back') ?? '/simulacros')
  const listado = back === '/talleres' ? '/talleres' : '/simulacros'

  if (!assessmentId) redirect(listado)

  let attemptId: string
  try {
    attemptId = await startOrResumeAttempt(userId, assessmentId)
  } catch (error) {
    if (error instanceof AttemptError) redirect(listado)
    throw error
  }
  redirect(`/simulacro/${attemptId}`)
}
