import Link from 'next/link'

import { createGroupAction, deleteGroupAction } from '@/app/admin/grupos/actions'
import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'

export default async function GruposPage() {
  await requireAdmin()

  const groups = await db.group.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { students: true, assessments: true } } },
  })

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">
        ← Panel
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-navy-900">Grupos / cohortes</h1>
      <p className="mb-6 text-muted-600">
        Un grupo reúne a los estudiantes de una cohorte (por ejemplo, el mes intensivo de febrero).
        Luego asignas a cada estudiante su grupo (en su ficha) y a cada simulacro los grupos que
        pueden verlo (en Simulacros). Un simulacro sin grupos lo ven todos.
      </p>

      {/* Crear un grupo */}
      <form action={createGroupAction} className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="text"
          name="name"
          required
          maxLength={60}
          placeholder="Nombre del grupo (ej. Mes A - 2026)"
          className="min-w-[16rem] flex-1 rounded-lg border border-brand-200 px-3 py-2"
        />
        <button className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white">
          Crear grupo
        </button>
      </form>

      {groups.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600">
          Todavía no hay grupos. Crea el primero arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-card p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-navy-900">{g.name}</p>
                <p className="text-sm text-muted-600">
                  {g._count.students} estudiante{g._count.students === 1 ? '' : 's'} ·{' '}
                  {g._count.assessments} simulacro{g._count.assessments === 1 ? '' : 's'} asignado
                  {g._count.assessments === 1 ? '' : 's'}
                </p>
              </div>
              <form action={deleteGroupAction}>
                <input type="hidden" name="groupId" value={g.id} />
                <button className="rounded-lg bg-danger/15 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/25">
                  Eliminar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
