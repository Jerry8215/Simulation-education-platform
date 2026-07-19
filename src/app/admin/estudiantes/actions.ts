'use server'

import { randomInt } from 'node:crypto'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/require'
import { hashPassword } from '@/lib/auth/password'
import { db } from '@/lib/db'

export type ResetState = {
  studentId: string | null
  password: string | null
  error: string | null
}

/**
 * Palabras fáciles de dictar por teléfono o WhatsApp. La contraseña temporal se
 * arma con dos de ellas y un número: "sora-tigre-4729". Más fácil de transmitir
 * sin errores que una cadena aleatoria, y solo sirve hasta que el estudiante la
 * cambie.
 */
const PALABRAS = [
  'tigre', 'nube', 'rio', 'sol', 'luna', 'campo', 'mar', 'bosque',
  'lluvia', 'viento', 'flor', 'roca', 'valle', 'cielo', 'faro', 'puente',
]

function temporaryPassword(): string {
  const a = PALABRAS[randomInt(PALABRAS.length)]
  const b = PALABRAS[randomInt(PALABRAS.length)]
  const n = randomInt(1000, 10000)
  return `sora-${a}-${b}${n}`
}

/**
 * Le pone al estudiante una contraseña temporal, que el administrador le pasa.
 *
 * Se eligió esto en vez del correo de recuperación porque no hace falta ningún
 * servicio de correo —que cuesta, se configura y se cae— y porque el
 * administrador ya está en contacto con sus estudiantes por WhatsApp.
 */
export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  await requireAdmin()

  const studentId = String(formData.get('studentId') ?? '')
  if (!studentId) return { studentId: null, password: null, error: 'Falta el estudiante.' }

  const student = await db.user.findFirst({
    where: { id: studentId, role: 'STUDENT' },
    select: { id: true },
  })
  // Solo estudiantes: el administrador no se restablece a sí mismo desde aquí.
  if (!student) {
    return { studentId: null, password: null, error: 'Estudiante no encontrado.' }
  }

  const password = temporaryPassword()
  await db.user.update({
    where: { id: studentId },
    data: { passwordHash: await hashPassword(password) },
  })

  revalidatePath(`/admin/estudiantes/${studentId}`)

  return { studentId, password, error: null }
}

/**
 * Suspende o reactiva el acceso de un estudiante. Un suspendido no puede iniciar
 * sesión, y si tenía una abierta, deja de servir en la siguiente página. Es
 * reversible: reactivar le devuelve el acceso sin tocar nada más de su cuenta.
 */
export async function toggleSuspendAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const studentId = String(formData.get('studentId') ?? '')
  const suspend = formData.get('suspend') === 'true'
  if (!studentId) return

  // Solo estudiantes: el administrador no se suspende a sí mismo desde aquí.
  const student = await db.user.findFirst({
    where: { id: studentId, role: 'STUDENT' },
    select: { id: true },
  })
  if (!student) return

  await db.user.update({ where: { id: studentId }, data: { suspended: suspend } })

  revalidatePath(`/admin/estudiantes/${studentId}`)
  revalidatePath('/admin/estudiantes')
}
