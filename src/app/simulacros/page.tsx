import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { startSimulacroAction } from '@/app/simulacros/actions'
import { PageBanner } from '@/components/layout/PageBanner'
import { Sidebar } from '@/components/layout/Sidebar'
import { StudentHeader } from '@/components/layout/StudentHeader'
import { requireUser } from '@/lib/auth/require'
import { listStudentSimulacros, type SimulacroCard } from '@/lib/attempts'
import { db } from '@/lib/db'

export default async function SimulacrosPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  if (!user.avatarChosen) redirect('/elige-avatar')

  const simulacros = await listStudentSimulacros(userId)

  const terminados = simulacros.filter((s) => s.status === 'DONE')
  const scores = terminados.map((s) => s.score).filter((s): s is number => s !== null)
  const promedio =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  return (
    <div className="min-h-dvh md:pl-60">
      <Sidebar />

      <main className="p-4 pb-24 md:p-8 md:pb-8">
        <StudentHeader
          fullName={user.fullName}
          avatarKey={user.avatarKey}
          slot={
            <nav className="text-lg text-muted-600">
              <Link href="/inicio" className="hover:underline">
                Inicio
              </Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-navy-900">Tus Simulacros</span>
            </nav>
          }
        />

        <PageBanner
          image="/assets/simulacros/banner-gato.png"
          title="Simulacros"
          subtitle="Pon a prueba tus conocimientos y sigue avanzando."
        />

        {/* Tu progreso global, debajo del banner para que la cabecera quede igual
            a la de las demás pantallas. */}
        <div className="mt-4 rounded-card bg-card p-5 shadow-sm">
          <p className="mb-3 font-bold text-brand-600">📊 Tu progreso global</p>
          <dl className="grid grid-cols-2 gap-3 text-center sm:max-w-md">
            <div className="rounded-xl bg-canvas p-3">
              <dd className="font-score text-3xl font-extrabold text-navy-900">{promedio ?? '—'}</dd>
              <dt className="text-xs text-muted-600">Puntaje promedio</dt>
            </div>
            <div className="rounded-xl bg-canvas p-3">
              <dd className="font-score text-3xl font-extrabold text-navy-900">
                {terminados.length}
                <span className="text-lg text-muted-600">/{simulacros.length}</span>
              </dd>
              <dt className="text-xs text-muted-600">Completados</dt>
            </div>
          </dl>
        </div>

        <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-semibold text-brand-600">
          <span>📖</span> Consulta tus simulacros disponibles
        </h2>

        {simulacros.length === 0 ? (
          <p className="rounded-card bg-card p-6 text-center text-muted-600 shadow-sm">
            Todavía no hay simulacros disponibles. Vuelve pronto.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {simulacros.map((s, index) => (
              <SimulacroCardView key={s.assessmentId} card={s} index={index} />
            ))}
          </div>
        )}

        {/* El dato curioso del diseño */}
        <aside className="mt-6 rounded-card bg-card p-5 text-center shadow-sm">
          <p className="font-bold text-brand-600">
            ¿Sabías que… en el ICFES no te descuentan puntos por respuestas incorrectas?
          </p>
          <p className="mt-1 text-sm text-navy-800">
            El ICFES utiliza la Teoría de Respuesta al Ítem (TRI), un modelo donde el valor de cada
            pregunta varía según su nivel de complejidad y cuántos estudiantes la contesten bien.
            ¡Por eso jamás hay que dejar respuestas en blanco!
          </p>
        </aside>
      </main>
    </div>
  )
}

/** Los cuatro iconos del diseño se reparten entre los simulacros disponibles. */
const ICONS = [
  '/assets/simulacros/iconos-simulacros/icono-1.png',
  '/assets/simulacros/iconos-simulacros/icono-3.png',
  '/assets/simulacros/iconos-simulacros/icono-4.png',
  '/assets/simulacros/iconos-simulacros/icono-simulacro-final.png',
]

function SimulacroCardView({ card, index }: { card: SimulacroCard; index: number }) {
  const done = card.status === 'DONE'

  return (
    <article className="flex gap-4 rounded-card bg-card p-5 shadow-sm">
      <Image
        src={ICONS[index % ICONS.length]!}
        alt=""
        width={72}
        height={72}
        className="h-16 w-16 shrink-0 rounded-full bg-brand-100 p-1"
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-navy-900">{card.title}</h3>
        <p className="text-sm text-brand-500">
          {card.questionCount} preguntas
          {card.durationMinutes ? ` · ${card.durationMinutes} min` : ''}
        </p>

        <p className="mt-2 text-sm text-brand-500">Progreso</p>
        <div className="mt-1 h-4 overflow-hidden rounded-full bg-brand-200">
          <div
            className="flex h-full items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white transition-all"
            style={{ width: done ? '100%' : '0%' }}
          >
            {done ? '100%' : ''}
          </div>
        </div>

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
    </article>
  )
}
