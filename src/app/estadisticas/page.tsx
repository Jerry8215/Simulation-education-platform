import Link from 'next/link'
import { redirect } from 'next/navigation'

import { startSimulacroAction } from '@/app/simulacros/actions'
import { PageBanner } from '@/components/layout/PageBanner'
import { StudentPage } from '@/components/layout/StudentPage'
import { EvolutionChart } from '@/components/stats/EvolutionChart'
import { requireUser } from '@/lib/auth/require'
import { db } from '@/lib/db'
import { getStudentStats, type AreaStat, type RecommendedItem } from '@/lib/stats'

export default async function EstadisticasPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  if (!user.avatarChosen) redirect('/elige-avatar')

  const stats = await getStudentStats(userId)
  const max = stats.evolutionScale === 'GLOBAL_500' ? 500 : 100
  const escala = stats.evolutionScale === 'GLOBAL_500' ? 'puntaje global' : 'porcentaje de aciertos'

  return (
    <StudentPage fullName={user.fullName} avatarKey={user.avatarKey} breadcrumb="Estadísticas">
      <PageBanner
        image="/assets/estadisticas/banner-principal-estadisticas.png"
        title="Mi progreso"
        subtitle="Visualiza cómo ha mejorado tu rendimiento."
      />

      {!stats.hasData ? (
        <section className="mt-6 rounded-card bg-card p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-navy-900">
            Todavía no hay nada que mostrar.
          </p>
          <p className="mx-auto mt-2 max-w-md text-muted-600">
            Presenta tu primer simulacro y aquí verás cómo evoluciona tu puntaje, en qué áreas eres
            fuerte y qué necesitas reforzar.
          </p>
          <Link
            href="/simulacros"
            className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white"
          >
            Ir a los simulacros
          </Link>
        </section>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Evolución del puntaje */}
            <section className="rounded-card bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-navy-900">
                📈 Evolución del Puntaje
              </h2>

              {stats.evolution.length < 2 ? (
                <div className="mt-4">
                  <EvolutionChart points={stats.evolution} max={max} />
                  <p className="mt-2 text-center text-sm text-muted-600">
                    Presenta otro simulacro y podrás ver tu progreso comparado.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-3">
                    <EvolutionChart points={stats.evolution} max={max} />
                  </div>
                  {stats.delta !== null && (
                    <p
                      className={`mt-2 rounded-xl px-4 py-2 text-center text-sm font-semibold ${
                        stats.delta > 0
                          ? 'bg-success/10 text-success'
                          : stats.delta < 0
                            ? 'bg-warning/10 text-warning'
                            : 'bg-brand-100 text-brand-600'
                      }`}
                    >
                      {stats.delta > 0
                        ? `¡Vas mejorando! Has subido ${stats.delta} puntos desde el último simulacro.`
                        : stats.delta < 0
                          ? `Bajaste ${Math.abs(stats.delta)} puntos. Repasa tus áreas débiles y vuelve a intentarlo.`
                          : 'Mantuviste tu puntaje respecto al simulacro anterior.'}
                    </p>
                  )}
                </>
              )}
              <p className="mt-2 text-center text-xs text-muted-600">
                Medido en {escala}.
              </p>
            </section>

            {/* Fortalezas y debilidades */}
            <section className="rounded-card bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-navy-900">
                ⭐ Fortalezas y Debilidades
              </h2>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold text-success">Tus Fortalezas</h3>
                  <div className="flex flex-col gap-3">
                    {stats.strengths.map((s) => (
                      <AreaBar key={s.area} stat={s} tone="success" />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-warning">Necesitas Reforzar</h3>
                  <div className="flex flex-col gap-3">
                    {stats.toReinforce.length > 0 ? (
                      stats.toReinforce.map((s) => (
                        <AreaBar key={s.area} stat={s} tone="warning" />
                      ))
                    ) : (
                      <p className="text-sm text-muted-600">
                        Presenta un simulacro que cubra más áreas para ver esto.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-600">
                Se ordenan de mayor a menor: las tres más altas son tus fortalezas.
              </p>
            </section>
          </div>

          {/* Práctica recomendada */}
          {stats.recommended.length > 0 && (
            <section className="mt-4 rounded-card bg-brand-100/60 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-navy-900">
                🎯 Práctica Recomendada para ti
              </h2>
              <p className="mb-4 text-sm text-navy-800">
                Elegida según las áreas donde más puedes mejorar.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.recommended.map((item) => (
                  <RecommendedCard key={item.assessmentId} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </StudentPage>
  )
}

function AreaBar({ stat, tone }: { stat: AreaStat; tone: 'success' | 'warning' }) {
  const bar = tone === 'success' ? 'bg-success' : 'bg-warning'
  const text = tone === 'success' ? 'text-success' : 'text-warning'

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-navy-900">{stat.areaLabel}</span>
        <span className={`text-sm font-bold ${text}`}>{stat.score}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-200">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${stat.score}%` }} />
      </div>
    </div>
  )
}

function RecommendedCard({ item }: { item: RecommendedItem }) {
  return (
    <article className="rounded-card bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-brand-500">
        {item.type === 'SIMULACRO' ? 'Simulacro' : 'Taller'}
      </p>
      <h3 className="font-bold text-navy-900">{item.title}</h3>
      {item.areaLabel && <p className="text-sm text-muted-600">{item.areaLabel}</p>}

      <form action={startSimulacroAction} className="mt-3">
        <input type="hidden" name="assessmentId" value={item.assessmentId} />
        <button className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white">
          ▶ {item.attemptId ? 'Continuar' : 'Iniciar'}
        </button>
      </form>
    </article>
  )
}
