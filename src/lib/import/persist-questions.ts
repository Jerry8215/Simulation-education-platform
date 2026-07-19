import 'server-only'

import { randomUUID } from 'node:crypto'

import { db } from '@/lib/db'
import type { Area } from '@/lib/scoring'
import type { ParsedQuestion } from '@/lib/import/parse-questions'

/**
 * Persiste las preguntas ya validadas, después de que el administrador revisó
 * la vista previa y confirmó la carga.
 *
 * Cada pregunta nace con su versión 1 (QuestionVersion), y la columna
 * `simulacro`/`taller` del Excel arma el assessment correspondiente: el mismo
 * archivo llena el banco de preguntas y ensambla los simulacros de una vez.
 *
 * POR QUÉ VA POR LOTES
 *
 * La primera versión hacía unas seis consultas por pregunta dentro de una
 * transacción. Con la base en Neon, cada consulta cruza la red: veinte
 * preguntas eran ~120 viajes de ida y vuelta, y la transacción se agotaba a los
 * dos minutos. Con los simulacros de 280 preguntas que planea el cliente, no
 * habría terminado nunca.
 *
 * Ahora todo lo que se puede resolver se resuelve ANTES de abrir la
 * transacción, los identificadores se generan aquí, y dentro de la transacción
 * solo quedan unas pocas escrituras en bloque. Son media docena de consultas en
 * total, sin importar cuántas preguntas traiga el archivo.
 */

export type PersistResult = {
  questionsCreated: number
  contextsCreated: number
  assessmentsTouched: string[]
}

export async function persistQuestions(questions: ParsedQuestion[]): Promise<PersistResult> {
  if (questions.length === 0) {
    return { questionsCreated: 0, contextsCreated: 0, assessmentsTouched: [] }
  }

  // ---- 1. Competencias: una consulta ----
  const competencies = await db.competency.findMany({ select: { id: true, area: true, name: true } })
  const competencyId = new Map<string, string>()
  for (const c of competencies) competencyId.set(`${c.area}::${fold(c.name)}`, c.id)

  // ---- 2. Contextos compartidos: una consulta para ver cuáles ya existen ----
  const contextKeys = [
    ...new Set(questions.filter((q) => q.contextKey && q.contextText).map((q) => q.contextKey!)),
  ]

  const existingContexts = contextKeys.length
    ? await db.context.findMany({ where: { externalId: { in: contextKeys } } })
    : []
  const contextIdByKey = new Map(existingContexts.map((c) => [c.externalId!, c.id]))

  const newContexts = contextKeys
    .filter((key) => !contextIdByKey.has(key))
    .map((key) => {
      const source = questions.find((q) => q.contextKey === key && q.contextText)!
      const id = randomUUID()
      contextIdByKey.set(key, id)
      return { id, externalId: key, text: source.contextText! }
    })

  // ---- 3. Assessments: una consulta para ver cuáles ya existen ----
  type AssessmentKey = { title: string; type: 'SIMULACRO' | 'TALLER' }
  const wanted = new Map<string, AssessmentKey & { area: Area | null }>()
  for (const q of questions) {
    const title = q.simulacro ?? q.taller
    if (!title) continue
    const type = q.simulacro ? 'SIMULACRO' : 'TALLER'
    const key = `${type}::${title}`
    if (!wanted.has(key)) {
      // Los talleres son de una sola área; los simulacros cubren varias.
      wanted.set(key, { title, type, area: type === 'TALLER' ? (q.area as Area) : null })
    }
  }

  const existingAssessments = wanted.size
    ? await db.assessment.findMany({
        where: { OR: [...wanted.values()].map(({ title, type }) => ({ title, type })) },
        select: { id: true, title: true, type: true },
      })
    : []
  const assessmentIdByKey = new Map(
    existingAssessments.map((a) => [`${a.type}::${a.title}`, a.id]),
  )

  const newAssessments = [...wanted.entries()]
    .filter(([key]) => !assessmentIdByKey.has(key))
    .map(([key, a]) => {
      const id = randomUUID()
      assessmentIdByKey.set(key, id)
      return {
        id,
        title: a.title,
        type: a.type,
        area: a.area,
        durationMinutes: a.type === 'SIMULACRO' ? 60 : null,
      }
    })

  // ---- 4. Orden de arranque de cada assessment: una consulta ----
  const assessmentIds = [...assessmentIdByKey.values()]
  const counts = assessmentIds.length
    ? await db.assessmentQuestion.groupBy({
        by: ['assessmentId'],
        where: { assessmentId: { in: assessmentIds } },
        _max: { order: true },
      })
    : []
  const nextOrder = new Map<string, number>()
  for (const id of assessmentIds) nextOrder.set(id, 0)
  for (const c of counts) nextOrder.set(c.assessmentId, c._max.order ?? 0)

  // ---- 5. Armar todas las filas en memoria ----
  const questionRows: Array<{
    id: string
    area: Area
    competencyId: string
    contextId: string | null
  }> = []
  const versionRows: Array<{
    id: string
    questionId: string
    version: number
    stem: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctOption: 'A' | 'B' | 'C' | 'D'
    explanation: string | null
    imageUrl: string | null
    optionAImageUrl: string | null
    optionBImageUrl: string | null
    optionCImageUrl: string | null
    optionDImageUrl: string | null
  }> = []
  const linkRows: Array<{
    assessmentId: string
    questionId: string
    order: number
    weight: number
    part: number
  }> = []
  const assessmentsTouched = new Set<string>()

  for (const q of questions) {
    const compId = competencyId.get(`${q.area}::${fold(q.competencia)}`)
    // No debería pasar: el validador ya lo rechazó. Si pasa, se salta.
    if (!compId) continue

    const questionId = randomUUID()
    const versionId = randomUUID()

    questionRows.push({
      id: questionId,
      area: q.area as Area,
      competencyId: compId,
      contextId: q.contextKey ? (contextIdByKey.get(q.contextKey) ?? null) : null,
    })

    versionRows.push({
      id: versionId,
      questionId,
      version: 1,
      stem: q.stem,
      optionA: q.options.A,
      optionB: q.options.B,
      optionC: q.options.C,
      optionD: q.options.D,
      correctOption: q.correctOption,
      explanation: q.explanation,
      imageUrl: resolveImageUrl(q.imageName),
      optionAImageUrl: resolveImageUrl(q.optionImages.A),
      optionBImageUrl: resolveImageUrl(q.optionImages.B),
      optionCImageUrl: resolveImageUrl(q.optionImages.C),
      optionDImageUrl: resolveImageUrl(q.optionImages.D),
    })

    const title = q.simulacro ?? q.taller
    if (title) {
      const type = q.simulacro ? 'SIMULACRO' : 'TALLER'
      const assessmentId = assessmentIdByKey.get(`${type}::${title}`)!
      const order = (nextOrder.get(assessmentId) ?? 0) + 1
      nextOrder.set(assessmentId, order)
      linkRows.push({ assessmentId, questionId, order, weight: q.weight, part: q.part })
      assessmentsTouched.add(title)
    }
  }

  // ---- 6. Escribir: unas pocas consultas en bloque ----
  const ids = questionRows.map((q) => q.id)

  await db.$transaction(
    async (tx) => {
      if (newContexts.length) await tx.context.createMany({ data: newContexts })
      if (newAssessments.length) await tx.assessment.createMany({ data: newAssessments })

      await tx.question.createMany({ data: questionRows })
      await tx.questionVersion.createMany({ data: versionRows })

      // La pregunta y su versión se referencian mutuamente, así que la versión
      // vigente se marca al final, de una sola vez.
      await tx.$executeRaw`
        UPDATE "Question" q
        SET "currentVersionId" = v.id
        FROM "QuestionVersion" v
        WHERE v."questionId" = q.id
          AND v.version = 1
          AND q.id = ANY(${ids}::text[])
      `

      if (linkRows.length) await tx.assessmentQuestion.createMany({ data: linkRows })
    },
    {
      // Con la base en la nube, esperar una conexión libre puede tardar más que
      // los 2 segundos que Prisma da por defecto.
      maxWait: 20_000,
      timeout: 60_000,
    },
  )

  return {
    questionsCreated: questionRows.length,
    contextsCreated: newContexts.length,
    assessmentsTouched: [...assessmentsTouched],
  }
}

/**
 * La URL de la imagen de una pregunta, a partir del nombre que trae el Excel.
 *
 * Se guarda una URL POR NOMBRE, no por id. As\u00ed el orden deja de importar: el
 * administrador puede cargar el Excel antes de subir las im\u00e1genes, y en cuanto
 * las suba con ese nombre, aparecen solas. Antes, cargar primero el Excel dejaba
 * la pregunta apuntando a un archivo inexistente y hab\u00eda que volver a cargarla.
 */
function resolveImageUrl(imageName: string | null): string | null {
  if (!imageName) return null
  return `/api/imagen/nombre/${encodeURIComponent(imageName)}`
}

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
