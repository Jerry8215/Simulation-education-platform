import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { toggleSuspendAction } from '@/app/admin/estudiantes/actions'
import { setStudentGroupAction } from '@/app/admin/grupos/actions'
import { ResetPassword } from '@/components/admin/ResetPassword'
import { requireAdmin } from '@/lib/auth/require'
import { avatarThumb } from '@/lib/avatars'
import { getStudentDetail } from '@/lib/admin-stats'
import { db } from '@/lib/db'

export default async function EstudiantePage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  await requireAdmin()
  const { studentId } = await params

  const student = await getStudentDetail(studentId)
  if (!student) notFound()

  const groups = await db.group.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })

  const fecha = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d)
      : '—'

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link href="/admin/estudiantes" className="text-sm text-brand-600 hover:underline">
        ← Estudiantes
      </Link>

      {/* Ficha */}
      <header className="mt-2 flex flex-wrap items-center gap-5 rounded-card bg-card p-6 shadow-sm">
        <Image
          src={avatarThumb(student.avatarKey)}
          alt=""
          width={80}
          height={80}
          className="h-20 w-20 rounded-full ring-2 ring-brand-200"
        />
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-navy-900">
            {student.fullName}
            {student.suspended && (
              <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-semibold text-danger">
                Acceso suspendido
              </span>
            )}
          </h1>
          <p className="text-muted-600">
            {student.email} · @{student.username}
          </p>
          <p className="mt-1 text-sm text-brand-600">
            Su meta: <strong>{student.targetScore}</strong> / 500
          </p>
        </div>
      </header>

      {/* Suspender o reactivar el acceso del estudiante */}
      <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card bg-card p-6 shadow-sm">
        <div>
          <h2 className="font-bold text-navy-900">Acceso a la plataforma</h2>
          <p className="text-sm text-muted-600">
            {student.suspended
              ? 'Este estudiante no puede iniciar sesión. Reactívalo para devolverle el acceso.'
              : 'Si un estudiante usa mal la plataforma, puedes suspenderle el acceso. Es reversible.'}
          </p>
        </div>
        <form action={toggleSuspendAction}>
          <input type="hidden" name="studentId" value={student.id} />
          <input type="hidden" name="suspend" value={(!student.suspended).toString()} />
          <button
            type="submit"
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              student.suspended
                ? 'bg-success/15 text-success hover:bg-success/25'
                : 'bg-danger/15 text-danger hover:bg-danger/25'
            }`}
          >
            {student.suspended ? 'Reactivar acceso' : 'Suspender acceso'}
          </button>
        </form>
      </section>

      {/* Grupo / cohorte: define a qué simulacros tiene acceso */}
      <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card bg-card p-6 shadow-sm">
        <div>
          <h2 className="font-bold text-navy-900">Grupo / cohorte</h2>
          <p className="text-sm text-muted-600">
            Define a qué simulacros tiene acceso.{' '}
            {groups.length === 0 && (
              <Link href="/admin/grupos" className="text-brand-600 hover:underline">
                Crea un grupo primero →
              </Link>
            )}
          </p>
        </div>
        <form action={setStudentGroupAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="studentId" value={student.id} />
          <select
            name="groupId"
            defaultValue={student.groupId ?? ''}
            className="rounded-lg border border-brand-200 px-3 py-2 text-sm"
          >
            <option value="">Sin grupo (ve los simulacros sin restricción)</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-navy-900 hover:bg-brand-100">
            Guardar
          </button>
        </form>
      </section>

      <ResetPassword studentId={student.id} fullName={student.fullName} />

      {/* Promedio por área */}
      {student.areaAverages.length > 0 && (
        <section className="mt-4 rounded-card bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-navy-900">Promedio por área</h2>
          <div className="flex flex-col gap-3">
            {student.areaAverages.map((a) => (
              <div key={a.area}>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-900">{a.areaLabel}</span>
                  <span className="font-bold text-brand-600">{a.score}/100</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-200">
                  <div
                    className={`h-full rounded-full ${a.score >= 60 ? 'bg-success' : 'bg-warning'}`}
                    style={{ width: `${a.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lo que ha presentado */}
      <section className="mt-4">
        <h2 className="mb-3 font-bold text-navy-900">Lo que ha presentado</h2>

        {student.attempts.length === 0 ? (
          <p className="rounded-card bg-card p-6 text-center text-muted-600 shadow-sm">
            Este estudiante todavía no ha presentado nada.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {student.attempts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-bold text-navy-900">
                    {a.title}
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-normal text-brand-600">
                      {a.type === 'SIMULACRO' ? 'Simulacro' : 'Taller'}
                    </span>
                  </p>
                  <p className="text-sm text-muted-600">{fecha(a.submittedAt)}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-navy-900">
                      {a.correctCount}
                      <span className="text-sm text-muted-600">/{a.totalQuestions}</span>
                    </p>
                    <p className="text-xs text-muted-600">aciertos</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-navy-900">{a.percent}%</p>
                    <p className="text-xs font-semibold text-success">{a.label}</p>
                  </div>

                  {a.globalScore !== null && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-brand-600">{a.globalScore}</p>
                      <p className="text-xs text-muted-600">/500</p>
                    </div>
                  )}

                  <Link
                    href={`/admin/intentos/${a.id}`}
                    className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    Ver respuestas
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
