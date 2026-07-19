'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { checkCode } from '@/lib/access-codes'
import { db } from '@/lib/db'
import { fakeVerify, hashPassword, verifyPassword } from '@/lib/auth/password'
import { createSessionCookie, destroySessionCookie } from '@/lib/auth/session'

export type AuthState = { error: string | null }

/** El código se reclamó entre la comprobación y la escritura (dos registros a la vez). */
class CodeAlreadyUsedError extends Error {}

const loginSchema = z.object({
  // El diseño pide "Usuario"; aceptamos también el correo por comodidad.
  identifier: z.string().trim().min(1, 'Escribe tu usuario.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  const { identifier, password } = parsed.data
  const user = await db.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier.toLowerCase() }],
    },
  })

  // Un correo inexistente y una contraseña errada dan el mismo mensaje y tardan
  // lo mismo: fakeVerify gasta el tiempo de un bcrypt para que nadie pueda
  // averiguar qué usuarios existen midiendo la respuesta.
  if (!user) {
    await fakeVerify(password)
    return { error: 'Usuario o contraseña incorrectos.' }
  }

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return { error: 'Usuario o contraseña incorrectos.' }

  // Un estudiante suspendido por el administrador no puede entrar. Se comprueba
  // DESPUÉS de la contraseña para no revelar quién está suspendido.
  if (user.suspended) {
    return { error: 'Tu acceso fue suspendido. Comunícate con el administrador de SORA.' }
  }

  const remember = formData.get('remember') === 'true'
  await createSessionCookie({ userId: user.id, role: user.role }, { remember })
  if (user.role === 'ADMIN') redirect('/admin')
  // Un estudiante que aún no eligió personaje lo hace antes de entrar.
  redirect(user.avatarChosen ? '/inicio' : '/elige-avatar')
}

const registerSchema = z
  .object({
    accessCode: z.string().trim().min(1, 'Escribe tu código de acceso.'),
    fullName: z.string().trim().min(3, 'Escribe tu nombre completo.'),
    username: z
      .string()
      .trim()
      .min(3, 'El usuario debe tener al menos 3 caracteres.')
      .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede tener letras, números, punto, guion y guion bajo.'),
    email: z.string().trim().toLowerCase().email('Escribe un correo válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirm'],
  })

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    accessCode: formData.get('accessCode'),
    fullName: formData.get('fullName'),
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  const { accessCode, fullName, username, email, password } = parsed.data

  // Sin código de acceso no hay registro: solo entra quien pagó el curso.
  const check = await checkCode(accessCode)
  if (!check.ok) {
    return {
      error:
        check.reason === 'ALREADY_USED'
          ? 'Ese código de acceso ya fue utilizado.'
          : 'El código de acceso no es válido. Verifícalo con SORA.',
    }
  }

  const clash = await db.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { username: true, email: true },
  })
  if (clash) {
    const which = clash.email === email ? 'correo' : 'usuario'
    return { error: `Ese ${which} ya está registrado.` }
  }

  const passwordHash = await hashPassword(password)

  // Crear el usuario y marcar el código como usado en una sola transacción.
  // Si dos personas intentan el mismo código a la vez, la condición `usedAt: null`
  // hace que solo una lo consiga; la otra recibe el error de "ya utilizado".
  let user
  try {
    user = await db.$transaction(async (tx) => {
      const claimed = await tx.accessCode.updateMany({
        where: { id: check.codeId, usedAt: null },
        data: { usedAt: new Date() },
      })
      if (claimed.count === 0) throw new CodeAlreadyUsedError()

      const created = await tx.user.create({
        data: { fullName, username, email, passwordHash, role: 'STUDENT' },
      })
      await tx.accessCode.update({
        where: { id: check.codeId },
        data: { usedById: created.id },
      })
      return created
    })
  } catch (error) {
    if (error instanceof CodeAlreadyUsedError) {
      return { error: 'Ese código de acceso ya fue utilizado.' }
    }
    throw error
  }

  await createSessionCookie({ userId: user.id, role: user.role })
  // Primero elige personaje (diseño, página 7); de ahí pasa a su panel.
  redirect('/elige-avatar')
}

export async function logoutAction(): Promise<void> {
  await destroySessionCookie()
  redirect('/ingresar')
}
