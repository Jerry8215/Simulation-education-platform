import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { startSimulacroAction } from '@/app/simulacros/actions'
import { PageBanner } from '@/components/layout/PageBanner'
import { StudentPage } from '@/components/layout/StudentPage'
import { requireUser } from '@/lib/auth/require'
import { listStudentTalleres, type SimulacroCard } from '@/lib/attempts'
import { db } from '@/lib/db'

export default async function TalleresPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  if (!user.avatarChosen) redirect('/elige-avatar')

  const talleres = await listStudentTalleres(userId)

  return (
    <StudentPage fullName={user.fullName} avatarKey={user.avatarKey} breadcrumb="Talleres">
      <PageBanner
        image="/assets/talleres/banner-principal.png"
        title="Talleres"
        subtitle="Practica tu conocimiento con preguntas tipo ICFES."
      />

      <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-semibold text-brand-600">
        <span>📖</span> Consulta tus talleres disponibles
      </h2>

      {talleres.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600 shadow-sm">
          Todavía no hay talleres disponibles.{' '}
          <Link href="/simulacros" className="font-semibold text-brand-600 hover:underline">
            Practica con los simulacros
          </Link>{' '}
          mientras tanto.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {talleres.map((t, index) => (
            <TallerCard key={t.assessmentId} card={t} index={index} />
          ))}
        </div>
      )}

      <aside className="mt-6 rounded-card bg-card p-5 text-center shadow-sm">
        <p className="text-sm text-navy-800">
          Los talleres <strong>no tienen cronómetro</strong>: tómate el tiempo que necesites. Sí
          cuentan para tus estadísticas por área, pero no para el puntaje global.
        </p>
      </aside>
    </StudentPage>
  )
}

const ICONS = [
  '/assets/talleres/icono-1.png',
  '/assets/talleres/icono-2.png',
  '/assets/talleres/icono-3.png',
]

function TallerCard({ card, index }: { card: SimulacroCard; index: number }) {
  const done = card.status === 'DONE'

  return (
    <article className="overflow-hidden rounded-card bg-card shadow-sm">
      {/* La portada que el administrador subió, arriba del todo. */}
      {card.coverUrl && (
        <Image
          src={card.coverUrl}
          alt=""
          width={600}
          height={200}
          className="h-32 w-full object-cover"
        />
      )}

      <div className="flex gap-4 p-5">
        <Image
          src={ICONS[index % ICONS.length]!}
          alt=""
          width={72}
          height={72}
          className="h-16 w-16 shrink-0 rounded-full bg-brand-100 p-1"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-navy-900">{card.title}</h3>
          {card.areaLabel && <p className="text-sm text-brand-500">{card.areaLabel}</p>}
          <p className="text-sm text-muted-600">{card.questionCount} preguntas</p>

          {done && card.score !== null && (
            <p className="mt-2 text-sm">
              Resultado: <span className="font-score text-xl font-bold text-brand-600">{card.score}%</span>
            </p>
          )}

          <div className="mt-3">
            {done ? (
              <Link
                href={`/resultados/${card.attemptId}`}
                className="inline-block rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Ver Resultados
              </Link>
            ) : (
              <form action={startSimulacroAction}>
                <input type="hidden" name="assessmentId" value={card.assessmentId} />
                <input type="hidden" name="back" value="/talleres" />
                <button
                  type="submit"
                  disabled={card.questionCount === 0}
                  className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  ▶ {card.status === 'IN_PROGRESS' ? 'Continuar' : 'Iniciar'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
