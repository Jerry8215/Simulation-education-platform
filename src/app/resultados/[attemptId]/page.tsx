import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { MathText } from '@/components/math/MathText'
import { requireUser } from '@/lib/auth/require'
import { AttemptError, getAttemptReview, type ReviewQuestion } from '@/lib/attempts'

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const { userId } = await requireUser()

  let review
  try {
    review = await getAttemptReview(userId, attemptId)
  } catch (error) {
    if (error instanceof AttemptError) redirect('/simulacros')
    throw error
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Salida visible: al terminar, botones claros para volver, no un enlace
          pequeño perdido en la esquina. */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/inicio"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          ← Volver al inicio
        </Link>
        <Link
          href="/simulacros"
          className="rounded-full border border-brand-200 px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-brand-100"
        >
          Ver más simulacros
        </Link>
      </div>

      <div className="mb-4 rounded-card bg-success/10 p-4 text-center">
        <p className="text-lg font-bold text-success">✔ ¡Terminaste!</p>
        <p className="text-sm text-navy-800">
          Estos son tus resultados de <strong>{review.title}</strong>.
        </p>
      </div>

      {/* Resumen */}
      <section className="grid gap-4 sm:grid-cols-3">
        {review.globalScore !== null && (
          <Tile label="Puntaje global" value={`${review.globalScore}`} sub="/500" big />
        )}
        <Tile label="Aciertos" value={`${review.correctCount}`} sub={`/${review.totalQuestions}`} />
        <Tile label="Desempeño" value={`${review.percent}%`} sub={review.label} />
      </section>

      {/* Puntaje por área */}
      {review.areaScores.length > 0 && (
        <section className="mt-6 rounded-card bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-navy-900">Puntaje por área</h2>
          <div className="flex flex-col gap-3">
            {review.areaScores.map((a) => (
              <div key={a.area}>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-900">{a.areaLabel}</span>
                  <span className="font-semibold text-brand-600">{a.score}/100</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-200">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${a.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Repaso pregunta por pregunta */}
      <section className="mt-6">
        <h2 className="mb-3 font-semibold text-navy-900">Revisa tus respuestas</h2>
        <div className="flex flex-col gap-3">
          {review.questions.map((q) => (
            <ReviewCard key={q.order} q={q} />
          ))}
        </div>
      </section>
    </main>
  )
}

function Tile({
  label,
  value,
  sub,
  big,
}: {
  label: string
  value: string
  sub?: string
  big?: boolean
}) {
  return (
    <div className="rounded-card bg-card p-4 text-center shadow-sm">
      <p className="text-sm text-muted-600">{label}</p>
      <p className={`font-bold text-brand-600 ${big ? 'text-4xl' : 'text-3xl'}`}>
        {value}
        {sub && <span className="text-lg text-muted-600">{sub}</span>}
      </p>
    </div>
  )
}

function ReviewCard({ q }: { q: ReviewQuestion }) {
  return (
    <article className="rounded-card bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-brand-600">
          {q.order}. {q.areaLabel}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
            q.isCorrect ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
          }`}
        >
          {q.isCorrect ? 'Correcta' : q.selected === null ? 'Sin responder' : 'Incorrecta'}
        </span>
      </div>
      <p className="mt-1 font-medium text-navy-900">
        <MathText text={q.stem} />
      </p>

      <ul className="mt-2 flex flex-col gap-1 text-sm">
        {q.options.map((o) => {
          const isCorrect = o.key === q.correct
          const isChosen = o.key === q.selected
          return (
            <li
              key={o.key}
              className={[
                'rounded-lg px-3 py-1.5',
                isCorrect ? 'bg-success/10 font-semibold text-success' : '',
                isChosen && !isCorrect ? 'bg-danger/10 text-danger line-through' : '',
                !isCorrect && !isChosen ? 'text-navy-800' : '',
              ].join(' ')}
            >
              {isCorrect ? '✔ ' : isChosen ? '✗ ' : ''}
              {o.key}. {o.text && <MathText text={o.text} />}
              {o.imageUrl && (
                <Image
                  src={o.imageUrl}
                  alt={`Opción ${o.key}`}
                  width={600}
                  height={450}
                  className="mt-1 max-h-56 w-auto max-w-full rounded-lg ring-1 ring-brand-200"
                />
              )}
            </li>
          )
        })}
      </ul>

      {q.explanation && (
        <p className="mt-2 rounded-lg bg-brand-100/50 px-3 py-2 text-sm text-navy-800">
          <strong>Por qué:</strong> <MathText text={q.explanation} />
        </p>
      )}
    </article>
  )
}
