'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/lib/auth/require'
import { advanceToNextPart, AttemptError, saveAnswer, submitAttempt } from '@/lib/attempts'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function saveAnswerAction(
  attemptId: string,
  order: number,
  selected: 'A' | 'B' | 'C' | 'D' | null,
  timeSpentMs: number,
): Promise<ActionResult> {
  const { userId } = await requireUser()
  try {
    await saveAnswer(userId, attemptId, order, selected, timeSpentMs)
    return { ok: true }
  } catch (error) {
    if (error instanceof AttemptError) return { ok: false, error: error.message }
    throw error
  }
}

/**
 * Cierra la parte en curso y abre la siguiente, con su propio cronómetro. Se usa
 * cuando el estudiante termina la primera parte de un simulacro de dos partes.
 */
export async function advancePartAction(attemptId: string): Promise<ActionResult> {
  const { userId } = await requireUser()
  try {
    await advanceToNextPart(userId, attemptId)
    return { ok: true }
  } catch (error) {
    if (error instanceof AttemptError) return { ok: false, error: error.message }
    throw error
  }
}

export async function submitAttemptAction(attemptId: string): Promise<ActionResult> {
  const { userId } = await requireUser()
  try {
    await submitAttempt(userId, attemptId)
    revalidatePath('/resultados')
    return { ok: true }
  } catch (error) {
    if (error instanceof AttemptError) return { ok: false, error: error.message }
    throw error
  }
}
