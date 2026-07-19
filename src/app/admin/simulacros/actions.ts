'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'

/**
 * Publica o despublica un simulacro. Solo los publicados aparecen a los
 * estudiantes. Un simulacro sin preguntas no se puede publicar.
 */
export async function togglePublishAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const assessmentId = String(formData.get('assessmentId') ?? '')
  const publish = formData.get('publish') === 'true'

  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { _count: { select: { questions: true } } },
  })
  if (!assessment) return

  // No dejamos publicar algo vacío: el estudiante no debe abrir un simulacro sin preguntas.
  if (publish && assessment._count.questions === 0) return

  await db.assessment.update({ where: { id: assessmentId }, data: { published: publish } })
  revalidatePath('/admin/simulacros')
}

/**
 * Cambia la duración (en minutos) de la PRIMERA parte de un simulacro. Los
 * talleres no tienen cronómetro (§8), así que a ellos no les aplica.
 *
 * El ICFES real se presenta en dos sesiones de un día. Para reproducirlo, la
 * columna `parte` del Excel marca a qué sesión pertenece cada pregunta, y aquí
 * se le pone tiempo a cada parte: este es el de la primera. La segunda se ajusta
 * con `setDurationPart2Action`.
 */
export async function setDurationAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const assessmentId = String(formData.get('assessmentId') ?? '')
  const minutes = Number(formData.get('minutes') ?? 0)
  if (!assessmentId) return

  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: { type: true },
  })
  if (!assessment || assessment.type !== 'SIMULACRO') return

  // Entre 5 minutos y 6 horas. Fuera de ese rango es casi seguro un error.
  const clamped = Number.isFinite(minutes) ? Math.min(360, Math.max(5, Math.round(minutes))) : 60

  await db.assessment.update({
    where: { id: assessmentId },
    data: { durationMinutes: clamped },
  })

  revalidatePath('/admin/simulacros')
}

/**
 * Fija (o quita) el tiempo de la SEGUNDA parte de un simulacro de dos sesiones.
 *
 * Vacío o 0 significa "una sola parte": el simulacro se presenta de corrido con
 * el tiempo de la primera. Con un valor, las preguntas marcadas `parte 2` en el
 * Excel se presentan aparte, con su propio cronómetro, y ambas notas se suman en
 * un único puntaje /500 al final.
 */
export async function setDurationPart2Action(formData: FormData): Promise<void> {
  await requireAdmin()

  const assessmentId = String(formData.get('assessmentId') ?? '')
  const raw = String(formData.get('minutes') ?? '').trim()
  if (!assessmentId) return

  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: { type: true },
  })
  if (!assessment || assessment.type !== 'SIMULACRO') return

  const minutes = Number(raw)
  // Vacío o 0: se quita la segunda parte. Si no, se limita como la primera.
  const value =
    raw === '' || minutes === 0
      ? null
      : Number.isFinite(minutes)
        ? Math.min(360, Math.max(5, Math.round(minutes)))
        : null

  await db.assessment.update({
    where: { id: assessmentId },
    data: { durationMinutesPart2: value },
  })

  revalidatePath('/admin/simulacros')
}

/**
 * Pone (o quita) la imagen de portada de un taller o simulacro. Es lo primero
 * que ve el estudiante al abrirlo, como la cabecera de un formulario de Google.
 */
export async function setCoverAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const assessmentId = String(formData.get('assessmentId') ?? '')
  const uploadId = String(formData.get('uploadId') ?? '')
  if (!assessmentId) return

  await db.assessment.update({
    where: { id: assessmentId },
    data: { coverUploadId: uploadId || null },
  })

  revalidatePath('/admin/simulacros')
  revalidatePath('/talleres')
  revalidatePath('/simulacros')
}
