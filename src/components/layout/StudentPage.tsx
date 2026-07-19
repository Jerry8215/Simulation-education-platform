import Link from 'next/link'

import { Sidebar } from '@/components/layout/Sidebar'
import { StudentHeader } from '@/components/layout/StudentHeader'

/**
 * Envoltorio de las pantallas del estudiante: barra lateral, cabecera con
 * avatar y migas de pan.
 */
export function StudentPage({
  fullName,
  avatarKey,
  breadcrumb,
  children,
}: {
  fullName: string
  avatarKey: string
  breadcrumb: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh md:pl-60">
      <Sidebar />
      <main className="p-4 pb-24 md:p-8 md:pb-8">
        <StudentHeader
          fullName={fullName}
          avatarKey={avatarKey}
          slot={
            <nav className="text-lg text-muted-600">
              <Link href="/inicio" className="hover:underline">
                Inicio
              </Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-navy-900">{breadcrumb}</span>
            </nav>
          }
        />
        {children}
      </main>
    </div>
  )
}

/** Para las secciones que todavía no están construidas. Honesto, no un 404. */
export function ComingSoon({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="rounded-card bg-card p-10 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted-600">{detail}</p>
      <Link
        href="/inicio"
        className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
