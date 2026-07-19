import 'server-only'

import { db } from '@/lib/db'
import { AREA_LABELS, qualitativeLabel, type Area } from '@/lib/scoring'

/**
 * Lo que el administrador necesita para seguir el trabajo de sus estudiantes:
 * quién ha presentado qué, cómo le fue, y qué respondió en cada pregunta.
 *
 * Los datos ya estaban: cada respuesta se guarda con su acierto o fallo desde
 * el primer día. Esto solo los reúne.
 */

export type StudentRow = {
  id: string
  fullName: string
  email: string
  avatarKey: string
  /** Si el administrador le suspendió el acceso. */
  suspended: boolean
  attemptsDone: number
  /** El mejor puntaje global de sus simulacros, si tiene alguno. */
  bestScore: number | null
  /** El promedio de aciertos de todo lo que ha presentado. */
  averagePercent: number | null
  lastActivity: Date | null
}

export async function listStudents(): Promise<StudentRow[]> {
  const students = await db.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { createdAt: 'desc' },
    include: {
      attempts: {
        where: { status: { in: ['SUBMITTED', 'EXPIRED'] } },
        select: { globalScore: true, percent: true, submittedAt: true },
      },
    },
  })

  return students.map((s) => {
    const done = s.attempts
    const globals = done.map((a) => a.globalScore).filter((g): g is number => g !== null)
    const percents = done.map((a) => a.percent).filter((p): p is number => p !== null)
    const dates = done.map((a) => a.submittedAt).filter((d): d is Date => d !== null)

    return {
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      avatarKey: s.avatarKey,
      suspended: s.suspended,
      attemptsDone: done.length,
      bestScore: globals.length > 0 ? Math.max(...globals) : null,
      averagePercent:
        percents.length > 0
          ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
          : null,
      lastActivity:
        dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null,
    }
  })
}

// ---------------------------------------------------------------------------
// El detalle de un estudiante
// ---------------------------------------------------------------------------

export type StudentAttempt = {
  id: string
  title: string
  type: 'SIMULACRO' | 'TALLER'
  submittedAt: Date | null
  globalScore: number | null
  percent: number
  label: string
  correctCount: number
  totalQuestions: number
  areaScores: Array<{ area: Area; areaLabel: string; score: number }>
}

export type StudentDetail = {
  id: string
  fullName: string
  email: string
  username: string
  avatarKey: string
  targetScore: number
  /** Si el administrador le suspendió el acceso. */
  suspended: boolean
  /** El grupo/cohorte al que pertenece, o null. */
  groupId: string | null
  attempts: StudentAttempt[]
  /** El promedio por área de todo lo que ha presentado. */
  areaAverages: Array<{ area: Area; areaLabel: string; score: number }>
}

export async function getStudentDetail(userId: string): Promise<StudentDetail | null> {
  const user = await db.user.findFirst({
    where: { id: userId, role: 'STUDENT' },
    include: {
      attempts: {
        where: { status: { in: ['SUBMITTED', 'EXPIRED'] } },
        orderBy: { submittedAt: 'desc' },
        include: {
          assessment: { select: { title: true, type: true } },
          areaScores: true,
          _count: { select: { answers: true } },
        },
      },
    },
  })
  if (!user) return null

  const attempts: StudentAttempt[] = user.attempts.map((a) => ({
    id: a.id,
    title: a.assessment.title,
    type: a.assessment.type,
    submittedAt: a.submittedAt,
    globalScore: a.globalScore,
    percent: a.percent ?? 0,
    label: qualitativeLabel(a.percent ?? 0),
    correctCount: a.correctCount ?? 0,
    totalQuestions: a._count.answers,
    areaScores: a.areaScores.map((s) => ({
      area: s.area as Area,
      areaLabel: AREA_LABELS[s.area as Area],
      score: s.score,
    })),
  }))

  // Promedio por área a lo largo de todos sus intentos.
  const sums = new Map<Area, { total: number; count: number }>()
  for (const attempt of user.attempts) {
    for (const s of attempt.areaScores) {
      const area = s.area as Area
      const acc = sums.get(area) ?? { total: 0, count: 0 }
      acc.total += s.score
      acc.count += 1
      sums.set(area, acc)
    }
  }

  const areaAverages = [...sums.entries()]
    .map(([area, { total, count }]) => ({
      area,
      areaLabel: AREA_LABELS[area],
      score: Math.round(total / count),
    }))
    .sort((a, b) => b.score - a.score)

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    avatarKey: user.avatarKey,
    targetScore: user.targetScore,
    suspended: user.suspended,
    groupId: user.groupId,
    attempts,
    areaAverages,
  }
}

// ---------------------------------------------------------------------------
// El detalle de un intento: qué respondió en cada pregunta
// ---------------------------------------------------------------------------

export type AnswerRow = {
  order: number
  areaLabel: string
  competency: string
  stem: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  selected: 'A' | 'B' | 'C' | 'D' | null
  correct: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  /** Segundos que tardó en esta pregunta. */
  seconds: number
}

export type AttemptDetail = {
  attemptId: string
  student: { id: string; fullName: string; avatarKey: string }
  title: string
  submittedAt: Date | null
  globalScore: number | null
  percent: number
  label: string
  correctCount: number
  totalQuestions: number
  areaScores: Array<{ area: Area; areaLabel: string; score: number }>
  answers: AnswerRow[]
}

export async function getAttemptDetail(attemptId: string): Promise<AttemptDetail | null> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { id: true, fullName: true, avatarKey: true } },
      assessment: { select: { title: true } },
      areaScores: true,
      answers: {
        orderBy: { order: 'asc' },
        include: {
          questionVersion: {
            include: {
              question: { include: { competency: { select: { name: true } } } },
            },
          },
        },
      },
    },
  })
  if (!attempt || attempt.status === 'IN_PROGRESS') return null

  return {
    attemptId: attempt.id,
    student: attempt.user,
    title: attempt.assessment.title,
    submittedAt: attempt.submittedAt,
    globalScore: attempt.globalScore,
    percent: attempt.percent ?? 0,
    label: qualitativeLabel(attempt.percent ?? 0),
    correctCount: attempt.correctCount ?? 0,
    totalQuestions: attempt.answers.length,
    areaScores: attempt.areaScores.map((s) => ({
      area: s.area as Area,
      areaLabel: AREA_LABELS[s.area as Area],
      score: s.score,
    })),
    answers: attempt.answers.map((a) => {
      const v = a.questionVersion
      return {
        order: a.order,
        areaLabel: AREA_LABELS[v.question.area as Area],
        competency: v.question.competency.name,
        stem: v.stem,
        options: { A: v.optionA, B: v.optionB, C: v.optionC, D: v.optionD },
        selected: a.selected,
        correct: v.correctOption,
        isCorrect: a.isCorrect,
        seconds: Math.round(a.timeSpentMs / 1000),
      }
    }),
  }
}

// ---------------------------------------------------------------------------
// Las preguntas que más falla el grupo
// ---------------------------------------------------------------------------

export type HardQuestion = {
  stem: string
  areaLabel: string
  answered: number
  correct: number
  percent: number
}

/**
 * Las preguntas donde más se equivoca el grupo. Sirven para detectar un tema mal
 * entendido —o una pregunta mal formulada—, que es justo lo que convierte esto
 * en una herramienta de clase y no solo de práctica individual.
 */
export async function hardestQuestions(limit = 10): Promise<HardQuestion[]> {
  const answers = await db.attemptAnswer.findMany({
    where: { attempt: { status: { in: ['SUBMITTED', 'EXPIRED'] } } },
    include: {
      questionVersion: {
        select: { id: true, stem: true, question: { select: { area: true } } },
      },
    },
  })

  const byQuestion = new Map<string, { stem: string; area: Area; total: number; ok: number }>()
  for (const a of answers) {
    const v = a.questionVersion
    const entry = byQuestion.get(v.id) ?? {
      stem: v.stem,
      area: v.question.area as Area,
      total: 0,
      ok: 0,
    }
    entry.total += 1
    if (a.isCorrect) entry.ok += 1
    byQuestion.set(v.id, entry)
  }

  return [...byQuestion.values()]
    // Con una sola respuesta no hay señal: podría ser un despiste.
    .filter((q) => q.total >= 2)
    .map((q) => ({
      stem: q.stem,
      areaLabel: AREA_LABELS[q.area],
      answered: q.total,
      correct: q.ok,
      percent: Math.round((q.ok / q.total) * 100),
    }))
    .sort((a, b) => a.percent - b.percent)
    .slice(0, limit)
}
