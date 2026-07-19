import Link from 'next/link'

import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'

export default async function MensajesPage() {
  await requireAdmin()

  const leads = await db.contactLead.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">
        ← Panel
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-navy-900">Mensajes de contacto</h1>
      <p className="mb-6 text-muted-600">
        Quienes dejaron sus datos en la página para inscribirse. Contáctalos y entrégales su código
        de acceso.
      </p>

      {leads.length === 0 ? (
        <p className="rounded-card bg-card p-6 text-center text-muted-600">
          Todavía no hay mensajes.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-card bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-navy-900">{lead.name}</p>
                  <p className="text-brand-600">
                    <a href={`https://wa.me/57${lead.phone.replace(/\D/g, '')}`} className="hover:underline">
                      {lead.phone}
                    </a>
                  </p>
                  <p className="mt-1 text-sm text-navy-800">{lead.interest}</p>
                </div>
                <p className="text-sm text-muted-600">
                  {new Intl.DateTimeFormat('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(lead.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
