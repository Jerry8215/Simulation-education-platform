import 'server-only'

import { redirect } from 'next/navigation'

import { db } from '@/lib/db'
import { getSession, type SessionPayload } from '@/lib/auth/session'

/** La sesión actual, o redirige al login. Para páginas y acciones de estudiante. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect('/ingresar')

  // Si el administrador suspendió la cuenta (o la borró) mientras el estudiante
  // tenía la sesión abierta, esa sesión deja de servir de inmediato. La cookie
  // no se puede borrar durante el render, pero el guardia la rechaza en cada
  // página, así que queda bloqueado igual.
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { suspended: true },
  })
  // Se pasa por /salir para BORRAR la cookie: si redirigiéramos directo a
  // /ingresar, el login vería la sesión aún viva y lo devolvería a /inicio, en
  // un rebote sin fin.
  if (!user || user.suspended) redirect('/salir?suspendido=1')

  return session
}

/** Como requireUser, pero exige rol de administrador. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect('/ingresar')
  if (session.role !== 'ADMIN') redirect('/inicio')
  return session
}
