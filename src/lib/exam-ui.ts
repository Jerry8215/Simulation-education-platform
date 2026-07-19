/**
 * Lógica pura de la pantalla del simulacro: formato del cronómetro y estado de
 * la navegación entre preguntas. Sin React, sin red: así se puede probar.
 *
 * El reloj de verdad vive en el servidor (attempts.ts). Esto solo decide cómo
 * se muestra la cuenta regresiva y qué preguntas quedan sin responder.
 */

export type QuestionState = {
  order: number
  answered: boolean
}

/** Segundos -> "mm:ss" o "h:mm:ss" cuando pasa de una hora. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

/**
 * A falta de cuánto tiempo, el reloj cambia de color para avisar sin alarmar.
 * Umbrales pensados para un simulacro de una hora o más.
 */
export function countdownUrgency(secondsRemaining: number | null): 'calm' | 'warning' | 'critical' {
  if (secondsRemaining === null) return 'calm'
  if (secondsRemaining <= 60) return 'critical'
  if (secondsRemaining <= 5 * 60) return 'warning'
  return 'calm'
}

export type NavProgress = {
  total: number
  answered: number
  /** Órdenes de las preguntas sin responder, para el aviso al enviar. */
  unanswered: number[]
  percent: number
}

export function navProgress(questions: QuestionState[]): NavProgress {
  const total = questions.length
  const answered = questions.filter((q) => q.answered).length
  const unanswered = questions.filter((q) => !q.answered).map((q) => q.order)
  return {
    total,
    answered,
    unanswered,
    percent: total === 0 ? 0 : Math.round((answered / total) * 100),
  }
}

/** El índice al que lleva "anterior"/"siguiente", sin salirse de los extremos. */
export function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(index, 0), total - 1)
}
