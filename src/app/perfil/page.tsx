import Image from 'next/image'
import { redirect } from 'next/navigation'

import { StudentPage } from '@/components/layout/StudentPage'
import {
  AvatarPicker,
  PasswordForm,
  ProfileDataForm,
} from '@/components/profile/ProfileForms'
import { requireUser } from '@/lib/auth/require'
import { avatarThumb } from '@/lib/avatars'
import { db } from '@/lib/db'

export default async function PerfilPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  if (!user.avatarChosen) redirect('/elige-avatar')

  return (
    <StudentPage fullName={user.fullName} avatarKey={user.avatarKey} breadcrumb="Mi Perfil">
      {/* Avatar */}
      <section className="rounded-card bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <Image
            src={avatarThumb(user.avatarKey)}
            alt=""
            width={96}
            height={96}
            className="h-20 w-20 rounded-full ring-4 ring-brand-200"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-navy-900">{user.fullName}</h1>
            <p className="text-brand-500">Estudiante · {user.avatarKey}</p>
          </div>
        </div>

        <div className="mt-4">
          <AvatarPicker current={user.avatarKey} />
        </div>
      </section>

      {/* Datos personales */}
      <section className="mt-4 rounded-card bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-navy-900">
          📋 Mi información
        </h2>
        <ProfileDataForm
          fullName={user.fullName}
          email={user.email}
          username={user.username}
          targetScore={user.targetScore}
        />
      </section>

      {/* Contraseña */}
      <section className="mt-4 rounded-card bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-navy-900">
          🔒 Cambiar mi contraseña
        </h2>
        <PasswordForm />
      </section>
    </StudentPage>
  )
}
