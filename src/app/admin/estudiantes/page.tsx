import Image from 'next/image'
import Link from 'next/link'

import { requireAdmin } from '@/lib/auth/require'
import { avatarThumb } from '@/lib/avatars'
import { hardestQuestions, listStudents } from '@/lib/admin-stats'

export default async function EstudiantesPage() {
  await requireAdmin()

  const [students, hardest] = await Promise.all([listStudents(), hardestQuestions(5)])

  const activos = students.filter((s) => s.attemptsDone > 0)
  const inactivos = students.filter((s) => s.attemptsDone === 0)

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">
        ← Panel
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-navy-900">Estudiantes</h1>
      <p className="mb-6 text-muted-600">
        Quién está practicando, cómo le va, y en qué se equivoca.
      </p>

      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-brand-100 px-3 py-1 font-medium text-brand-600">
          {students.length} estudiantes
        </span>
        <span className="rounded-full bg-success/15 px-3 py-1 font-medium text-success">
          {activos.length} han practicado
        </span>
        {inactivos.length > 0 && (
          <span className="rounded-full bg-warning/15 px-3 py-1 font-medium text-warning">
            {inactivos.length} sin practicar
          </span>
        )}
      </div>

      {students.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600">
          Todavía no hay estudiantes registrados.{' '}
          <Link href="/admin/codigos" className="text-brand-600 hover:underline">
            Genera códigos de acceso
          </Link>{' '}
          para invitarlos.
        </p>
      ) : (
        <div className="overflow-hidden rounded-card bg-card shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-brand-100/60 text-sm text-navy-900">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4 text-center">Presentados</th>
                <th className="p-4 text-center">Promedio</th>
                <th className="p-4 text-center">Mejor puntaje</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-brand-100">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={avatarThumb(s.avatarKey)}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full ring-1 ring-brand-200"
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold text-navy-900">
                          {s.fullName}
                          {s.suspended && (
                            <span className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
                              Suspendido
                            </span>
                          )}
                        </p>
                        <p className="truncate text-sm text-muted-600">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {s.attemptsDone > 0 ? (
                      <span className="font-bold text-navy-900">{s.attemptsDone}</span>
                    ) : (
                      <span className="rounded-full bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
                        Sin practicar
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center font-bold text-navy-900">
                    {s.averagePercent !== null ? `${s.averagePercent}%` : '—'}
                  </td>
                  <td className="p-4 text-center font-bold text-brand-600">
                    {s.bestScore !== null ? s.bestScore : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/estudiantes/${s.id}`}
                      className="rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Las preguntas que más falla el grupo */}
      {hardest.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-1 text-lg font-bold text-navy-900">
            Las preguntas que más falla el grupo
          </h2>
          <p className="mb-4 text-sm text-muted-600">
            Si casi todos fallan una, puede ser un tema mal entendido… o una pregunta mal
            formulada. Vale la pena revisarlas.
          </p>

          <ul className="flex flex-col gap-2">
            {hardest.map((q, i) => (
              <li key={i} className="rounded-card bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase text-brand-600">{q.areaLabel}</p>
                    <p className="text-navy-900">{q.stem}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        q.percent < 40 ? 'text-danger' : 'text-warning'
                      }`}
                    >
                      {q.percent}%
                    </p>
                    <p className="text-xs text-muted-600">
                      {q.correct} de {q.answered} aciertos
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
