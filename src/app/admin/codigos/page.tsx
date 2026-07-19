import Link from 'next/link'

import { deleteCodeAction } from '@/app/admin/codigos/actions'
import { GenerateCodes } from '@/components/admin/GenerateCodes'
import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'

export default async function CodigosPage() {
  await requireAdmin()

  const codes = await db.accessCode.findMany({
    orderBy: [{ usedAt: 'asc' }, { createdAt: 'desc' }],
    include: { usedBy: { select: { fullName: true, email: true } } },
  })

  const libres = codes.filter((c) => !c.usedAt).length
  const usados = codes.length - libres

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">
        ← Panel
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-navy-900">Códigos de acceso</h1>
      <p className="mb-6 text-muted-600">
        Sin un código, nadie puede registrarse. Así solo entran los estudiantes que pagaron.
      </p>

      <div className="mb-6 flex gap-3 text-sm">
        <span className="rounded-full bg-success/15 px-3 py-1 font-medium text-success">
          {libres} sin usar
        </span>
        <span className="rounded-full bg-brand-100 px-3 py-1 font-medium text-brand-600">
          {usados} ya usados
        </span>
      </div>

      <GenerateCodes />

      <h2 className="mb-3 mt-8 font-semibold text-navy-900">Todos los códigos</h2>
      {codes.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600">
          Todavía no has generado ninguno.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {codes.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-card p-3 shadow-sm"
            >
              <div>
                <p className="font-mono font-semibold tracking-wider text-navy-900">{c.code}</p>
                <p className="text-sm text-muted-600">
                  {c.usedBy
                    ? `Usado por ${c.usedBy.fullName} (${c.usedBy.email})`
                    : c.note
                      ? c.note
                      : 'Sin usar'}
                </p>
              </div>

              {c.usedAt ? (
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-600">
                  Usado
                </span>
              ) : (
                <form action={deleteCodeAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="rounded-lg border border-brand-200 px-3 py-1 text-xs text-danger hover:bg-danger/10">
                    Anular
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
