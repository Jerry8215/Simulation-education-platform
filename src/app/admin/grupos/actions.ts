'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'

/** Crea un grupo/cohorte nuevo (ej. "Mes A - 2026"). El nombre es único. */
export async function createGroupAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const name = String(formData.get('name') ?? '').trim()
  if (!name) return

  // Si ya existe uno con ese nombre, no se duplica.
  const existing = await db.group.findUnique({ where: { name } })
  if (existing) return

  await db.group.create({ data: { name } })
  revalidatePath('/admin/grupos')
}

/**
 * Borra un grupo. Los estudiantes que lo tenían quedan sin grupo (ven solo los
 * simulacros sin restricción), y las asignaciones de simulacros a ese grupo se
 * eliminan. No se borra ningún estudiante ni simulacro.
 */
export async function deleteGroupAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const groupId = String(formData.get('groupId') ?? '')
  if (!groupId) return

  await db.group.delete({ where: { id: groupId } })
  revalidatePath('/admin/grupos')
  revalidatePath('/admin/estudiantes')
  revalidatePath('/admin/simulacros')
}

/** Pone (o quita) a un estudiante en un grupo. groupId vacío = sin grupo. */
export async function setStudentGroupAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const studentId = String(formData.get('studentId') ?? '')
  const groupId = String(formData.get('groupId') ?? '')
  if (!studentId) return

  const student = await db.user.findFirst({
    where: { id: studentId, role: 'STUDENT' },
    select: { id: true },
  })
  if (!student) return

  await db.user.update({
    where: { id: studentId },
    data: { groupId: groupId || null },
  })

  revalidatePath(`/admin/estudiantes/${studentId}`)
  revalidatePath('/admin/grupos')
}

/**
 * Fija a qué grupos tiene acceso un simulacro. Recibe la lista completa de
 * grupos marcados y reemplaza lo que había. Sin ninguno = sin restricción (lo
 * ven todos).
 */
export async function setAssessmentGroupsAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const assessmentId = String(formData.get('assessmentId') ?? '')
  if (!assessmentId) return
  const groupIds = formData.getAll('groupIds').map(String).filter(Boolean)

  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: { id: true },
  })
  if (!assessment) return

  // Reemplazo simple: se borra lo anterior y se ponen los marcados.
  await db.$transaction([
    db.assessmentGroup.deleteMany({ where: { assessmentId } }),
    ...(groupIds.length
      ? [db.assessmentGroup.createMany({ data: groupIds.map((groupId) => ({ assessmentId, groupId })) })]
      : []),
  ])

  revalidatePath('/admin/simulacros')
}
