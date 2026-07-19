import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MathText } from '@/components/math/MathText'
import { requireAdmin } from '@/lib/auth/require'
import { avatarThumb } from '@/lib/avatars'
import { getAttemptDetail, type AnswerRow } from '@/lib/admin-stats'

export default async function IntentoPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  await requireAdmin()
  const { attemptId } = await params

  const detail = await getAttemptDetail(attemptId)
  if (!detail) notFound()

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href={`/admin/estudiantes/${detail.student.id}`}
        className="text-sm text-brand-600 hover:underline"
      >
        ← {detail.student.fullName}
      </Link>

      <header className="mt-2 flex flex-wrap items-center gap-4 rounded-card bg-card p-5 shadow-sm">
        <Image
          src={avatarThumb(detail.student.avatarKey)}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-full ring-1 ring-brand-200"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-navy-900">{detail.title}</h1>
          <p className="text-sm text-muted-600">{detail.student.fullName}</p>
        </div>

        <div className="flex items-center gap-6">
          <Stat value={`${detail.correctCount}/${detail.totalQuestions}`} label="aciertos" />
          <Stat value={`${detail.percent}%`} label={detail.label} />
          {detail.globalScore !== null && (
            <Stat value={String(detail.globalScore)} label="/500" highlight />
          )}
        </div>
      </header>

      {detail.areaScores.length > 0 && (
        <section className="mt-4 rounded-card bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-bold text-navy-900">Puntaje por área</h2>
          <div className="flex flex-col gap-2.5">
            {detail.areaScores.map((a) => (
              <div key={a.area}>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-900">{a.areaLabel}</span>
                  <span className="font-bold text-brand-600">{a.score}/100</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-200">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${a.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="mb-3 mt-6 font-bold text-navy-900">Respuesta por respuesta</h2>
      <ul className="flex flex-col gap-3">
        {detail.answers.map((a) => (
          <AnswerCard key={a.order} answer={a} />
        ))}
      </ul>
    </main>
  )
}

function Stat({
  value,
  label,
  highlight,
}: {
  value: string
  label: string
  highlight?: boolean
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${highlight ? 'text-brand-600' : 'text-navy-900'}`}>
        {value}
      </p>
      <p className="text-xs text-muted-600">{label}</p>
    </div>
  )
}

function AnswerCard({ answer }: { answer: AnswerRow }) {
  const estado = answer.isCorrect
    ? { texto: 'Correcta', clase: 'bg-success/15 text-success' }
    : answer.selected === null
      ? { texto: 'Sin responder', clase: 'bg-muted-600/15 text-muted-600' }
      : { texto: 'Incorrecta', clase: 'bg-danger/15 text-danger' }

  return (
    <li className="rounded-card bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-brand-600">
          {answer.order}. {answer.areaLabel} · {answer.competency}
        </p>
        <div className="flex items-center gap-2">
          {answer.seconds > 0 && (
            <span className="text-xs text-muted-600">⏱ {formatSeconds(answer.seconds)}</span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${estado.clase}`}>
            {estado.texto}
          </span>
        </div>
      </div>

      <p className="mt-1 font-medium text-navy-900">
        <MathText text={answer.stem} />
      </p>

      <ul className="mt-2 flex flex-col gap-1 text-sm">
        {answer.options.map((option) => {
          const esCorrecta = option.key === answer.correct
          const laEligio = option.key === answer.selected

          return (
            <li
              key={option.key}
              className={[
                'rounded-lg px-3 py-1.5',
                esCorrecta ? 'bg-success/10 font-semibold text-success' : '',
                laEligio && !esCorrecta ? 'bg-danger/10 text-danger line-through' : '',
                !esCorrecta && !laEligio ? 'text-navy-800' : '',
              ].join(' ')}
            >
              {esCorrecta ? '✔ ' : laEligio ? '✗ ' : ''}
              {option.key}. {option.text && <MathText text={option.text} />}
              {option.imageUrl && (
                <Image
                  src={option.imageUrl}
                  alt={`Opción ${option.key}`}
                  width={500}
                  height={375}
                  className="mt-1 max-h-44 w-auto max-w-full rounded ring-1 ring-brand-200"
                />
              )}
              {laEligio && (
                <span className="ml-2 text-xs font-normal opacity-80">(su respuesta)</span>
              )}
            </li>
          )
        })}
      </ul>
    </li>
  )
}

function formatSeconds(total: number): string {
  if (total < 60) return `${total}s`
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${min}m ${sec}s`
}
