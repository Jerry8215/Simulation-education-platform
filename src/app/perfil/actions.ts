'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireUser } from '@/lib/auth/require'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { isAvatarKey } from '@/lib/avatars'
import { db } from '@/lib/db'

export type ProfileState = { ok: boolean; error: string | null; message: string | null }

const profileSchema = z.object({
  fullName: z.string().trim().min(3, 'Escribe tu nombre completo.'),
  email: z.string().trim().toLowerCase().email('Escribe un correo válido.'),
  // La meta la fija el estudiante (§6 del modelo aprobado).
  targetScore: z.coerce
    .number()
    .int('La meta debe ser un número entero.')
    .min(100, 'La meta mínima es 100.')
    .max(500, 'La meta máxima es 500, como en el ICFES.'),
})

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { userId } = await requireUser()

  const parsed = profileSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    targetScore: formData.get('targetScore'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.', message: null }
  }

  const { fullName, email, targetScore } = parsed.data

  // El correo es único: no se puede tomar el de otro estudiante.
  const taken = await db.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  })
  if (taken) return { ok: false, error: 'Ese correo ya está registrado.', message: null }

  await db.user.update({ where: { id: userId }, data: { fullName, email, targetScore } })
  revalidatePath('/perfil')
  revalidatePath('/inicio')

  return { ok: true, error: null, message: 'Tus datos quedaron guardados.' }
}

export async function changeAvatarAction(formData: FormData): Promise<void> {
  const { userId } = await requireUser()
  const key = formData.get('avatarKey')
  if (!isAvatarKey(key)) return

  await db.user.update({ where: { id: userId }, data: { avatarKey: key } })
  revalidatePath('/perfil')
  revalidatePath('/inicio')
}

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Escribe tu contraseña actual.'),
    next: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: 'Las contraseñas nuevas no coinciden.',
    path: ['confirm'],
  })

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { userId } = await requireUser()

  const parsed = passwordSchema.safeParse({
    current: formData.get('current'),
    next: formData.get('next'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.', message: null }
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })

  // Sin la contraseña actual no se cambia: si alguien deja la sesión abierta,
  // no debe poder secuestrar la cuenta cambiándola.
  const ok = await verifyPassword(parsed.data.current, user.passwordHash)
  if (!ok) return { ok: false, error: 'Tu contraseña actual no es correcta.', message: null }

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  })

  return { ok: true, error: null, message: 'Tu contraseña quedó cambiada.' }
}
