/**
 * Motor de calificación — SORA PREICFES
 *
 * Implementa el documento MODELO_DE_CALIFICACION.md aprobado por el cliente.
 * Todo aquí es puro: sin base de datos, sin red, sin fechas. Así se puede probar.
 *
 * Este archivo solo se ejecuta en el servidor. Las respuestas correctas entran
 * como parámetro y nunca vuelven a salir.
 */

export const AREAS = [
  'LECTURA_CRITICA',
  'MATEMATICAS',
  'SOCIALES_CIUDADANAS',
  'CIENCIAS_NATURALES',
  'INGLES',
] as const

export type Area = (typeof AREAS)[number]

export const AREA_LABELS: Record<Area, string> = {
  LECTURA_CRITICA: 'Lectura Crítica',
  MATEMATICAS: 'Matemáticas',
  SOCIALES_CIUDADANAS: 'Sociales y Ciudadanas',
  CIENCIAS_NATURALES: 'Ciencias Naturales',
  INGLES: 'Inglés',
}

/**
 * Ponderación oficial del ICFES para Saber 11 (§2).
 * Las cuatro áreas centrales pesan 3, Inglés pesa 1. Suma 13.
 */
const AREA_WEIGHTS: Record<Area, number> = {
  LECTURA_CRITICA: 3,
  MATEMATICAS: 3,
  SOCIALES_CIUDADANAS: 3,
  CIENCIAS_NATURALES: 3,
  INGLES: 1,
}

const TOTAL_WEIGHT = 13

// ---------------------------------------------------------------------------
// §1 · Puntaje por área
// ---------------------------------------------------------------------------

export type AreaTally = { obtained: number; possible: number }

/** Porcentaje de puntos obtenidos sobre posibles, de 0 a 100. */
export function areaScore({ obtained, possible }: AreaTally): number {
  if (possible <= 0) return 0
  return Math.round((obtained / possible) * 100)
}

// ---------------------------------------------------------------------------
// §2 · Puntaje global
// ---------------------------------------------------------------------------

/**
 * global = [ (LC + Mat + Soc + CN) × 3 + Inglés × 1 ] ÷ 13 × 5
 *
 * Devuelve null si el simulacro no cubre las cinco áreas: un puntaje global
 * calculado sobre áreas faltantes no sería comparable con el ICFES real, y
 * mostrarlo sería mentirle al estudiante.
 */
export function globalScore(scores: Partial<Record<Area, number>>): number | null {
  const missing = AREAS.filter((a) => scores[a] === undefined)
  if (missing.length > 0) return null

  const weighted = AREAS.reduce((sum, a) => sum + scores[a]! * AREA_WEIGHTS[a], 0)
  return Math.round((weighted / TOTAL_WEIGHT) * 5)
}

// ---------------------------------------------------------------------------
// §3 · Nota cualitativa
// ---------------------------------------------------------------------------

export type Label = 'Sobresaliente' | 'Excelente' | 'Bueno' | 'Básico' | 'Necesita refuerzo'

export function qualitativeLabel(percent: number): Label {
  if (percent >= 90) return 'Sobresaliente'
  if (percent >= 75) return 'Excelente'
  if (percent >= 60) return 'Bueno'
  if (percent >= 40) return 'Básico'
  return 'Necesita refuerzo'
}

// ---------------------------------------------------------------------------
// §4 · Fortalezas y debilidades
// ---------------------------------------------------------------------------

/**
 * Ranking, no umbral: las tres áreas más altas son fortalezas, las dos más bajas
 * necesitan refuerzo. Un estudiante que arranca bajo en todo igual ve tres
 * fortalezas, y ese es justo al que no queremos desmotivar.
 *
 * Empates: se rompen por el orden de AREAS, que es estable. Dos estudiantes con
 * los mismos puntajes siempre ven el mismo ranking.
 */
export function strengthsAndWeaknesses(scores: Partial<Record<Area, number>>): {
  strengths: Array<{ area: Area; score: number }>
  toReinforce: Array<{ area: Area; score: number }>
} {
  const ranked = AREAS.filter((a) => scores[a] !== undefined)
    .map((area) => ({ area, score: scores[area]! }))
    .sort((x, y) => y.score - x.score || AREAS.indexOf(x.area) - AREAS.indexOf(y.area))

  return {
    strengths: ranked.slice(0, 3),
    toReinforce: ranked.slice(3),
  }
}

// ---------------------------------------------------------------------------
// Calificación de un intento completo
// ---------------------------------------------------------------------------

/** Lo mínimo que el motor necesita saber de una respuesta para calificarla. */
export type GradableAnswer = {
  area: Area
  weight: number
  /** null = en blanco. Cuenta como incorrecta y no resta puntos (§1). */
  selected: 'A' | 'B' | 'C' | 'D' | null
  correctOption: 'A' | 'B' | 'C' | 'D'
}

export type GradedAttempt = {
  /** 0..100 sobre el intento completo, base de la nota cualitativa (§3). */
  percent: number
  label: Label
  /** 0..500. Null en talleres y en simulacros que no cubren las cinco áreas. */
  globalScore: number | null
  correctCount: number
  totalWeight: number
  obtainedWeight: number
  areaScores: Array<{ area: Area; score: number; obtained: number; possible: number }>
  /** Índice de qué respuestas fueron correctas, en el mismo orden que entraron. */
  results: boolean[]
}

export function gradeAttempt(answers: GradableAnswer[]): GradedAttempt {
  const tallies = new Map<Area, AreaTally>()
  const results: boolean[] = []

  let obtainedWeight = 0
  let totalWeight = 0
  let correctCount = 0

  for (const answer of answers) {
    const weight = Math.max(1, answer.weight)
    const isCorrect = answer.selected !== null && answer.selected === answer.correctOption

    results.push(isCorrect)
    totalWeight += weight
    if (isCorrect) {
      obtainedWeight += weight
      correctCount += 1
    }

    const tally = tallies.get(answer.area) ?? { obtained: 0, possible: 0 }
    tally.possible += weight
    if (isCorrect) tally.obtained += weight
    tallies.set(answer.area, tally)
  }

  const areaScores = AREAS.filter((a) => tallies.has(a)).map((area) => {
    const tally = tallies.get(area)!
    return { area, score: areaScore(tally), obtained: tally.obtained, possible: tally.possible }
  })

  const scoreByArea: Partial<Record<Area, number>> = {}
  for (const { area, score } of areaScores) scoreByArea[area] = score

  const percent = totalWeight > 0 ? Math.round((obtainedWeight / totalWeight) * 100) : 0

  return {
    percent,
    label: qualitativeLabel(percent),
    globalScore: globalScore(scoreByArea),
    correctCount,
    totalWeight,
    obtainedWeight,
    areaScores,
    results,
  }
}

// ---------------------------------------------------------------------------
// §6 · Avance hacia la meta
// ---------------------------------------------------------------------------

export function goalProgress(currentGlobal: number, targetScore: number): number {
  if (targetScore <= 0) return 0
  return Math.min(100, Math.round((currentGlobal / targetScore) * 100))
}
