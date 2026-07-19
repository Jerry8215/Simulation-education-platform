import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { TargetIcon, TrophyIcon, WorkshopIcon } from '@/components/icons/StatIcons'
import { Sidebar } from '@/components/layout/Sidebar'
import { StudentHeader } from '@/components/layout/StudentHeader'
import { requireUser } from '@/lib/auth/require'
import { db } from '@/lib/db'

export default async function InicioPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
  if (!user.avatarChosen) redirect('/elige-avatar')

  // Los números del panel salen de sus intentos ya calificados.
  const attempts = await db.attempt.findMany({
    where: { userId, status: { in: ['SUBMITTED', 'EXPIRED'] } },
    orderBy: { submittedAt: 'desc' },
    include: { assessment: { select: { type: true } } },
  })

  const simulacros = attempts.filter((a) => a.assessment.type === 'SIMULACRO')
  const talleres = attempts.filter((a) => a.assessment.type === 'TALLER')

  const globalScores = simulacros
    .map((a) => a.globalScore)
    .filter((score): score is number => score !== null)

  // "Puntaje Global" del diseño = el del último simulacro terminado (§5).
  const ultimoGlobal = globalScores[0] ?? null
  const mejorPuntaje = globalScores.length > 0 ? Math.max(...globalScores) : null

  const firstName = user.fullName.split(' ')[0] ?? user.fullName

  return (
    <div className="min-h-dvh md:pl-60">
      <Sidebar />

      <main className="p-4 pb-24 md:p-8 md:pb-8">
        <StudentHeader
          fullName={user.fullName}
          avatarKey={user.avatarKey}
          slot={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/simulacros"
                className="rounded-full bg-navy-900 px-5 py-2.5 font-semibold text-white transition hover:bg-navy-800"
              >
                ▶ Iniciar Simulacro
              </Link>
              <Link
                href="/talleres"
                className="rounded-full bg-white px-5 py-2.5 font-semibold text-navy-900 ring-1 ring-brand-200 transition hover:bg-brand-100"
              >
                Iniciar Taller
              </Link>
            </div>
          }
        />

        {/* Banner de bienvenida a TODO EL ANCHO, como el diseño de la clienta: la
            ilustración de fondo (gato subiendo a la universidad) y, encima, el
            saludo y el puntaje sobre el cielo despejado de la izquierda, y el
            mensaje de ánimo abajo a la derecha. La imagen va a su proporción
            natural (h-auto) para no recortar ni el gato ni la universidad. */}
        <section className="relative mt-4 overflow-hidden rounded-card shadow-sm">
          <Image
            src="/assets/dashboard/banner-hero.png"
            alt=""
            width={1800}
            height={745}
            className="h-auto w-full"
            priority
          />

          <div className="absolute inset-0 p-4 sm:p-6 lg:p-8">
            {/* Arriba a la izquierda, sobre el cielo: el saludo y la tarjeta
                grande del puntaje, una debajo de la otra (como en el diseño). */}
            <div className="flex max-w-[64%] flex-col items-start gap-2 sm:gap-4">
              <div>
                <h1 className="text-lg font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
                  Hola, <span className="text-brand-600">{firstName}</span> 👋
                </h1>
                <p className="mt-0.5 text-[11px] font-medium text-navy-800 sm:text-base">
                  Hoy es un buen día para acercarte a tu meta
                </p>
              </div>

              <div className="rounded-2xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm sm:px-6 sm:py-4">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-navy-900 sm:text-sm">
                  🏆 Puntaje global
                </p>
                <p className="font-score text-3xl font-extrabold leading-none text-navy-900 sm:text-6xl">
                  {ultimoGlobal ?? '—'}
                  <span className="text-lg font-bold text-brand-500 sm:text-3xl">/500</span>
                </p>
              </div>
            </div>

            {/* Abajo a la derecha: el mensaje de ánimo. */}
            <div className="absolute bottom-4 right-4 hidden max-w-[40%] rounded-2xl bg-white/90 px-4 py-2.5 text-right shadow-md backdrop-blur-sm sm:bottom-6 sm:right-6 sm:block">
              <p className="text-sm font-bold text-brand-600">VAS POR BUEN CAMINO</p>
              <p className="text-xs text-navy-800">Sigue así, lo estás haciendo increíble</p>
            </div>
          </div>
        </section>

        {/* Las tres tarjetas del diseño */}
        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<TargetIcon className="h-16 w-16" />}
            label="Simulacros"
            value={simulacros.length}
            caption="Realizados"
          />
          <StatCard
            icon={<WorkshopIcon className="h-16 w-16" />}
            label="Talleres"
            value={talleres.length}
            caption="Completados"
          />
          <StatCard
            icon={<TrophyIcon className="h-16 w-16" />}
            label="Mejor Puntaje"
            value={mejorPuntaje ?? '—'}
            caption="puntos"
          />
        </section>

        {simulacros.length === 0 && (
          <p className="mt-5 rounded-card bg-card p-5 text-center text-muted-600 shadow-sm">
            Todavía no has presentado ningún simulacro.{' '}
            <Link href="/simulacros" className="font-semibold text-brand-600 hover:underline">
              Empieza por aquí
            </Link>{' '}
            y tus resultados aparecerán en este panel.
          </p>
        )}
      </main>
    </div>
  )
}

/**
 * Antes la tarjeta era una imagen del diseño con el texto encima: al estirarla
 * se veía pixelada y el icono salía enorme junto a un texto diminuto. Ahora la
 * tarjeta es HTML y el icono es SVG, así que es nítida a cualquier tamaño y las
 * proporciones se controlan aquí.
 *
 * El número va en Montserrat, como en el reporte oficial del ICFES.
 */
function StatCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  caption: string
}) {
  return (
    <article className="flex items-center gap-4 rounded-card bg-card p-5 shadow-sm">
      {icon}
      <div className="min-w-0 leading-tight">
        <p className="text-base font-bold text-brand-500 sm:text-lg">{label}</p>
        <p className="font-score text-3xl font-extrabold text-navy-900 sm:text-4xl">{value}</p>
        <p className="text-sm text-muted-600">{caption}</p>
      </div>
    </article>
  )
}
