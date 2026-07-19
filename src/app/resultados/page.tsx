import Link from 'next/link'
import { redirect } from 'next/navigation'

import { PageBanner } from '@/components/layout/PageBanner'
import { StudentPage } from '@/components/layout/StudentPage'
import { requireUser } from '@/lib/auth/require'
import { db } from '@/lib/db'
import { qualitativeLabel } from '@/lib/scoring'

export default async function ResultadosPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  if (!user.avatarChosen) redirect('/elige-avatar')

  const attempts = await db.attempt.findMany({
    where: { userId, status: { in: ['SUBMITTED', 'EXPIRED'] } },
    orderBy: { submittedAt: 'desc' },
    include: { assessment: { select: { title: true, type: true } } },
  })

  const globales = attempts
    .map((a) => a.globalScore)
    .filter((s): s is number => s !== null)
  const mejor = globales.length > 0 ? Math.max(...globales) : null

  return (
    <StudentPage fullName={user.fullName} avatarKey={user.avatarKey} breadcrumb="Resultados">
      <PageBanner
        image="/assets/resultados/banner-principal.png"
        title="Resultados"
        subtitle="Identifica tus errores y refuerza tu análisis."
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card bg-card p-5 text-center shadow-sm">
          <p className="font-semibold text-brand-500">🏆 Mejor Puntaje</p>
          <p className="font-score text-4xl font-extrabold text-navy-900">
            {mejor ?? '—'}
            <span className="text-xl text-brand-500">/500</span>
          </p>
        </div>
        <div className="rounded-card bg-card p-5 text-center shadow-sm">
          <p className="font-semibold text-brand-500">🎯 Tu Meta</p>
          <p className="font-score text-4xl font-extrabold text-navy-900">{user.targetScore}</p>
        </div>
      </div>

      <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-semibold text-brand-600">
        <span>📖</span> Consulta tus resultados disponibles
      </h2>

      {attempts.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600 shadow-sm">
          Todavía no has terminado ningún simulacro.{' '}
          <Link href="/simulacros" className="font-semibold text-brand-600 hover:underline">
            Presenta el primero
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {attempts.map((a) => {
            const percent = a.percent ?? 0
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-bold text-navy-900">{a.assessment.title}</p>
                  <p className="text-sm text-muted-600">
                    {a.submittedAt
                      ? new Intl.DateTimeFormat('es-CO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }).format(a.submittedAt)
                      : ''}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-navy-900">{percent}%</p>
                    <p className="text-sm font-semibold text-success">{qualitativeLabel(percent)}</p>
                  </div>
                  <Link
                    href={`/resultados/${a.id}`}
                    className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Ver Resultados
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </StudentPage>
  )
}
