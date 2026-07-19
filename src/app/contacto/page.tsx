import { redirect } from 'next/navigation'

import { StudentPage } from '@/components/layout/StudentPage'
import { requireUser } from '@/lib/auth/require'
import { db } from '@/lib/db'

export default async function ContactoPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  if (!user.avatarChosen) redirect('/elige-avatar')

  return (
    <StudentPage fullName={user.fullName} avatarKey={user.avatarKey} breadcrumb="Contáctanos">
      <section className="rounded-card bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-navy-900">¡Contacta a SORA!</h1>
        <p className="mt-2 text-navy-800">
          Si tienes preguntas o dudas, escríbenos. Estamos para acompañarte.
        </p>

        <dl className="mt-6 flex flex-col gap-4">
          <div>
            <dt className="text-sm font-semibold text-brand-600">WhatsApp</dt>
            <dd className="text-navy-900">
              <a href="https://wa.me/573244162444" className="hover:underline">
                324 4162444
              </a>{' '}
              ·{' '}
              <a href="https://wa.me/573052940334" className="hover:underline">
                305 2940334
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-brand-600">Correo</dt>
            <dd>
              <a href="mailto:sorapreicfes@gmail.com" className="text-navy-900 hover:underline">
                sorapreicfes@gmail.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-brand-600">Instagram y TikTok</dt>
            <dd className="text-navy-900">@soraicfes</dd>
          </div>
        </dl>
      </section>
    </StudentPage>
  )
}
