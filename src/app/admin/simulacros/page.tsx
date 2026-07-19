import Image from 'next/image'
import Link from 'next/link'

import {
  setCoverAction,
  setDurationAction,
  setDurationPart2Action,
  togglePublishAction,
} from '@/app/admin/simulacros/actions'
import { setAssessmentGroupsAction } from '@/app/admin/grupos/actions'
import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'
import { AREA_LABELS, type Area } from '@/lib/scoring'
import { imageUrl } from '@/lib/uploads'

export default async function AdminSimulacrosPage() {
  await requireAdmin()

  const [assessments, uploads, part2Counts, groups] = await Promise.all([
    db.assessment.findMany({
      orderBy: [{ type: 'asc' }, { title: 'asc' }],
      include: {
        _count: { select: { questions: true, attempts: true } },
        coverUpload: { select: { id: true, filename: true } },
        groups: { select: { groupId: true } },
      },
    }),
    db.upload.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, filename: true } }),
    // Cuántas preguntas marcó el Excel como "parte 2" en cada simulacro. Sin
    // preguntas de parte 2, poner un tiempo de parte 2 no cambia nada.
    db.assessmentQuestion.groupBy({
      by: ['assessmentId'],
      where: { part: 2 },
      _count: { _all: true },
    }),
    db.group.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const part2CountByAssessment = new Map(
    part2Counts.map((row) => [row.assessmentId, row._count._all]),
  )

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">
        ← Panel
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-navy-900">Simulacros y talleres</h1>
      <p className="mb-6 text-muted-600">
        Un simulacro solo aparece a los estudiantes cuando está publicado. La portada es lo primero
        que ven al abrirlo.
      </p>

      {assessments.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600">
          Todavía no hay simulacros. Se crean solos al cargar preguntas con la columna
          &quot;Simulacro&quot; o &quot;taller&quot; llena.{' '}
          <Link href="/admin/preguntas/importar" className="text-brand-600 hover:underline">
            Cargar preguntas
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {assessments.map((a) => (
            <li key={a.id} className="rounded-card bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-navy-900">
                    {a.title}
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-600">
                      {a.type === 'SIMULACRO' ? 'Simulacro' : 'Taller'}
                    </span>
                    {a.area && (
                      <span className="ml-1 text-xs text-muted-600">{AREA_LABELS[a.area as Area]}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-600">
                    {a._count.questions} preguntas · {a._count.attempts} presentaciones
                  </p>
                </div>

                <form action={togglePublishAction}>
                  <input type="hidden" name="assessmentId" value={a.id} />
                  <input type="hidden" name="publish" value={(!a.published).toString()} />
                  <button
                    type="submit"
                    disabled={!a.published && a._count.questions === 0}
                    className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 ${
                      a.published ? 'bg-success/15 text-success' : 'bg-navy-900 text-white'
                    }`}
                    title={
                      !a.published && a._count.questions === 0
                        ? 'No se puede publicar un simulacro sin preguntas'
                        : ''
                    }
                  >
                    {a.published ? 'Publicado ✓ (ocultar)' : 'Publicar'}
                  </button>
                </form>
              </div>

              {/* Duración: solo los simulacros tienen cronómetro */}
              {a.type === 'SIMULACRO' && (
                <div className="mt-3 space-y-2">
                  <form
                    action={setDurationAction}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <input type="hidden" name="assessmentId" value={a.id} />
                    <label className="text-navy-900">
                      {a.durationMinutesPart2 ? 'Tiempo sesión 1:' : 'Duración:'}{' '}
                      <input
                        type="number"
                        name="minutes"
                        min={5}
                        max={360}
                        defaultValue={a.durationMinutes ?? 60}
                        className="w-24 rounded-lg border border-brand-200 px-3 py-1.5"
                      />{' '}
                      minutos
                    </label>
                    <button className="rounded-lg border border-brand-200 px-3 py-1.5 text-navy-900 hover:bg-brand-100">
                      Guardar
                    </button>
                    <span className="text-muted-600">
                      ({formatDuration(a.durationMinutes ?? 60)})
                    </span>
                  </form>

                  {/* Segunda parte: el simulacro se presenta en dos sesiones. */}
                  <form
                    action={setDurationPart2Action}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <input type="hidden" name="assessmentId" value={a.id} />
                    <label className="text-navy-900">
                      Tiempo sesión 2:{' '}
                      <input
                        type="number"
                        name="minutes"
                        min={0}
                        max={360}
                        placeholder="—"
                        defaultValue={a.durationMinutesPart2 ?? ''}
                        className="w-24 rounded-lg border border-brand-200 px-3 py-1.5"
                      />{' '}
                      minutos
                    </label>
                    <button className="rounded-lg border border-brand-200 px-3 py-1.5 text-navy-900 hover:bg-brand-100">
                      Guardar
                    </button>
                    <span className="text-muted-600">
                      {a.durationMinutesPart2
                        ? `(${formatDuration(a.durationMinutesPart2)} · ${
                            part2CountByAssessment.get(a.id) ?? 0
                          } preguntas en la sesión 2)`
                        : '(vacío = una sola sesión)'}
                    </span>
                  </form>

                  {a.durationMinutesPart2 && !part2CountByAssessment.get(a.id) && (
                    <p className="text-xs text-warning">
                      Fijaste tiempo de sesión 2, pero ninguna pregunta está marcada como
                      &quot;sesión 2&quot; en el Excel. Marca la columna &quot;Sesión&quot; con 2 en las
                      preguntas de la segunda sesión.
                    </p>
                  )}
                </div>
              )}

              {/* Grupos con acceso: sin ninguno marcado, lo ven todos */}
              <div className="mt-4 border-t border-brand-100 pt-4">
                <form action={setAssessmentGroupsAction}>
                  <input type="hidden" name="assessmentId" value={a.id} />
                  <p className="text-sm font-medium text-navy-900">Grupos con acceso</p>
                  {groups.length === 0 ? (
                    <p className="mt-1 text-sm text-muted-600">
                      No hay grupos.{' '}
                      <Link href="/admin/grupos" className="text-brand-600 hover:underline">
                        Crea uno
                      </Link>{' '}
                      para restringir el acceso. Por ahora lo ven todos.
                    </p>
                  ) : (
                    <>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                        {groups.map((g) => (
                          <label key={g.id} className="flex items-center gap-1.5 text-sm text-navy-900">
                            <input
                              type="checkbox"
                              name="groupIds"
                              value={g.id}
                              defaultChecked={a.groups.some((ag) => ag.groupId === g.id)}
                              className="h-4 w-4 rounded border-brand-300"
                            />
                            {g.name}
                          </label>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm text-navy-900 hover:bg-brand-100">
                          Guardar acceso
                        </button>
                        <span className="text-sm text-muted-600">
                          {a.groups.length === 0
                            ? 'Sin restricción: lo ven todos los estudiantes.'
                            : `Solo lo ven los estudiantes de ${a.groups.length} grupo${a.groups.length === 1 ? '' : 's'}.`}
                        </span>
                      </div>
                    </>
                  )}
                </form>
              </div>

              {/* Portada */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-brand-100 pt-4">
                {a.coverUpload ? (
                  <Image
                    src={imageUrl(a.coverUpload.id)}
                    alt=""
                    width={160}
                    height={90}
                    className="h-16 w-28 rounded-lg object-cover ring-1 ring-brand-200"
                  />
                ) : (
                  <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-canvas text-xs text-muted-600 ring-1 ring-brand-200">
                    Sin portada
                  </div>
                )}

                <form action={setCoverAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="assessmentId" value={a.id} />
                  <label className="text-sm text-navy-900">
                    Portada:{' '}
                    <select
                      name="uploadId"
                      defaultValue={a.coverUpload?.id ?? ''}
                      className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
                    >
                      <option value="">Sin portada</option>
                      {uploads.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.filename}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm text-navy-900 hover:bg-brand-100">
                    Guardar
                  </button>
                </form>

                {uploads.length === 0 && (
                  <Link href="/admin/imagenes" className="text-sm text-brand-600 hover:underline">
                    Sube una imagen primero →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

/** 270 -> "4 h 30 min". Para que la cifra en minutos se entienda de un vistazo. */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}
