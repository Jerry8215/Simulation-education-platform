import 'server-only'

import { db } from '@/lib/db'
import {
  AREA_LABELS,
  strengthsAndWeaknesses,
  type Area,
} from '@/lib/scoring'

/**
 * Las estadísticas del estudiante (pantalla "Mi progreso", página 12).
 *
 * Todo se deriva de sus intentos ya calificados. Las reglas son las del modelo
 * aprobado: los talleres alimentan las estadísticas por área pero no el puntaje
 * global (§8), y las fortalezas son un ranking, no un umbral (§4).
 */

export type StatsPoint = {
  label: string
  value: number
}

export type AreaStat = {
  area: Area
  areaLabel: string
  score: number
}

export type RecommendedItem = {
  assessmentId: string
  title: string
  type: 'SIMULACRO' | 'TALLER'
  areaLabel: string | null
  /** El intento en curso, si lo hay. */
  attemptId: string | null
}

export type StudentStats = {
  hasData: boolean
  /** La evolución del puntaje a lo largo de sus simulacros. */
  evolution: StatsPoint[]
  /**
   * En qué escala está la evolución. Si todos sus simulacros cubren las cinco
   * áreas, es el puntaje global sobre 500; si no, el porcentaje de aciertos,
   * porque un global calculado sobre áreas faltantes no sería comparable.
   */
  evolutionScale: 'GLOBAL_500' | 'PERCENT_100'
  /** Cuánto subió (o bajó) respecto al simulacro anterior. */
  delta: number | null
  strengths: AreaStat[]
  toReinforce: AreaStat[]
  recommended: RecommendedItem[]
}

export async function getStudentStats(userId: string): Promise<StudentStats> {
  const attempts = await db.attempt.findMany({
    where: { userId, status: { in: ['SUBMITTED', 'EXPIRED'] } },
    orderBy: { submittedAt: 'asc' },
    include: {
      assessment: { select: { title: true, type: true } },
      areaScores: true,
    },
  })

  const empty: StudentStats = {
    hasData: false,
    evolution: [],
    evolutionScale: 'PERCENT_100',
    delta: null,
    strengths: [],
    toReinforce: [],
    recommended: [],
  }
  if (attempts.length === 0) return { ...empty, recommended: await recommendFor(userId, []) }

  // --- Evolución: solo los simulacros ---
  const simulacros = attempts.filter((a) => a.assessment.type === 'SIMULACRO')
  const allHaveGlobal = simulacros.length > 0 && simulacros.every((a) => a.globalScore !== null)

  const evolution: StatsPoint[] = simulacros.map((a, index) => ({
    label: a.assessment.title || `Simulacro ${index + 1}`,
    value: allHaveGlobal ? a.globalScore! : (a.percent ?? 0),
  }))

  const delta =
    evolution.length >= 2
      ? evolution[evolution.length - 1]!.value - evolution[evolution.length - 2]!.value
      : null

  // --- Promedio por área: simulacros Y talleres (§8) ---
  const sums = new Map<Area, { total: number; count: number }>()
  for (const attempt of attempts) {
    for (const areaScore of attempt.areaScores) {
      const area = areaScore.area as Area
      const acc = sums.get(area) ?? { total: 0, count: 0 }
      acc.total += areaScore.score
      acc.count += 1
      sums.set(area, acc)
    }
  }

  const averages: Partial<Record<Area, number>> = {}
  for (const [area, { total, count }] of sums) {
    averages[area] = Math.round(total / count)
  }

  const ranked = strengthsAndWeaknesses(averages)
  const toStat = (s: { area: Area; score: number }): AreaStat => ({
    area: s.area,
    areaLabel: AREA_LABELS[s.area],
    score: s.score,
  })

  const toReinforce = ranked.toReinforce.map(toStat)

  return {
    hasData: true,
    evolution,
    evolutionScale: allHaveGlobal ? 'GLOBAL_500' : 'PERCENT_100',
    delta,
    strengths: ranked.strengths.map(toStat),
    toReinforce,
    recommended: await recommendFor(
      userId,
      toReinforce.map((s) => s.area),
    ),
  }
}

/**
 * Práctica recomendada (§7): contenido de las áreas donde el estudiante va más
 * bajo, que todavía no haya terminado. Si aún no tiene resultados, se le
 * ofrecen los primeros simulacros disponibles.
 */
async function recommendFor(userId: string, weakAreas: Area[]): Promise<RecommendedItem[]> {
  const assessments = await db.assessment.findMany({
    where: {
      published: true,
      // Los talleres son de una sola área: se filtran por las débiles. Los
      // simulacros cubren varias, así que siempre son buena práctica.
      ...(weakAreas.length > 0
        ? { OR: [{ type: 'SIMULACRO' }, { type: 'TALLER', area: { in: weakAreas } }] }
        : {}),
    },
    include: {
      attempts: { where: { userId }, orderBy: { startedAt: 'desc' }, take: 1 },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return assessments
    .filter((a) => a._count.questions > 0)
    // Lo ya terminado no se recomienda: no se puede repetir (§9).
    .filter((a) => {
      const last = a.attempts[0]
      return !last || last.status === 'IN_PROGRESS'
    })
    .slice(0, 4)
    .map((a) => ({
      assessmentId: a.id,
      title: a.title,
      type: a.type,
      areaLabel: a.area ? AREA_LABELS[a.area as Area] : null,
      attemptId: a.attempts[0]?.id ?? null,
    }))
}
