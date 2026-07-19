import Link from 'next/link'

import { requireAdmin } from '@/lib/auth/require'
import { db } from '@/lib/db'
import { logoutAction } from '@/lib/auth/actions'

export default async function AdminPage() {
  await requireAdmin()

  const [students, questions, simulacros] = await Promise.all([
    db.user.count({ where: { role: 'STUDENT' } }),
    db.question.count({ where: { archivedAt: null } }),
    db.assessment.count({ where: { type: 'SIMULACRO' } }),
  ])

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Panel de administrador</h1>
        <form action={logoutAction}>
          <button className="rounded-lg border border-brand-200 px-4 py-2 text-navy-900">
            Cerrar sesión
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Estudiantes" value={students} />
        <Stat label="Preguntas" value={questions} />
        <Stat label="Simulacros" value={simulacros} />
      </div>

      <nav className="mt-8 flex flex-col gap-3">
        <Link
          href="/admin/estudiantes"
          className="rounded-card bg-card p-4 font-medium text-navy-900 shadow-sm hover:ring-1 hover:ring-brand-200"
        >
          Estudiantes →
          <span className="block text-sm font-normal text-muted-600">
            Quién practica, cómo le va, qué respondió en cada pregunta, y las preguntas que más
            falla el grupo.
          </span>
        </Link>
        <Link
          href="/admin/preguntas/importar"
          className="rounded-card bg-card p-4 font-medium text-navy-900 shadow-sm hover:ring-1 hover:ring-brand-200"
        >
          Cargar preguntas desde Excel →
        </Link>
        <Link
          href="/admin/simulacros"
          className="rounded-card bg-card p-4 font-medium text-navy-900 shadow-sm hover:ring-1 hover:ring-brand-200"
        >
          Simulacros y talleres →
          <span className="block text-sm font-normal text-muted-600">
            Publícalos y ponles una imagen de portada.
          </span>
        </Link>
        <Link
          href="/admin/imagenes"
          className="rounded-card bg-card p-4 font-medium text-navy-900 shadow-sm hover:ring-1 hover:ring-brand-200"
        >
          Imágenes →
          <span className="block text-sm font-normal text-muted-600">
            Sube las portadas de tus talleres y las gráficas de tus preguntas.
          </span>
        </Link>
        <Link
          href="/admin/codigos"
          className="rounded-card bg-card p-4 font-medium text-navy-900 shadow-sm hover:ring-1 hover:ring-brand-200"
        >
          Códigos de acceso →
          <span className="block text-sm font-normal text-muted-600">
            Genera un código por cada estudiante que paga. Sin código no hay registro.
          </span>
        </Link>
        <Link
          href="/admin/grupos"
          className="rounded-card bg-card p-4 font-medium text-navy-900 shadow-sm hover:ring-1 hover:ring-brand-200"
        >
          Grupos / cohortes →
          <span className="block text-sm font-normal text-muted-600">
            Controla qué simulacros ve cada cohorte de estudiantes.
          </span>
        </Link>
        <Link
          href="/admin/mensajes"
          className="rounded-card bg-card p-4 font-medium text-navy-900 shadow-sm hover:ring-1 hover:ring-brand-200"
        >
          Mensajes de contacto →
          <span className="block text-sm font-normal text-muted-600">
            Quienes dejaron sus datos en la página pública para inscribirse.
          </span>
        </Link>
      </nav>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card bg-card p-4 text-center shadow-sm">
      <p className="text-3xl font-bold text-brand-600">{value}</p>
      <p className="text-sm text-muted-600">{label}</p>
    </div>
  )
}
