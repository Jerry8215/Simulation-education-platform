'use server'

import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/auth/require'
import { isAvatarKey } from '@/lib/avatars'
import { db } from '@/lib/db'

/** Guarda el avatar elegido y lleva al estudiante a su panel. */
export async function chooseAvatarAction(formData: FormData): Promise<void> {
  const { userId } = await requireUser()

  const key = formData.get('avatarKey')
  if (!isAvatarKey(key)) redirect('/elige-avatar')

  await db.user.update({
    where: { id: userId },
    data: { avatarKey: key, avatarChosen: true },
  })

  redirect('/inicio')
}
