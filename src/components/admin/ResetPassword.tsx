'use client'

import { useActionState } from 'react'

import { resetPasswordAction, type ResetState } from '@/app/admin/estudiantes/actions'

const initial: ResetState = { studentId: null, password: null, error: null }

export function ResetPassword({ studentId, fullName }: { studentId: string; fullName: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial)

  return (
    <section className="mt-4 rounded-card bg-card p-6 shadow-sm">
      <h2 className="font-bold text-navy-900">🔒 ¿Olvidó su contraseña?</h2>
      <p className="mt-1 text-sm text-muted-600">
        Genera una contraseña temporal y pásasela por WhatsApp. {fullName.split(' ')[0]} entra con
        ella y luego la cambia desde su perfil.
      </p>

      <form action={action} className="mt-4">
        <input type="hidden" name="studentId" value={studentId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-brand-200 px-5 py-2 font-medium text-navy-900 hover:bg-brand-100 disabled:opacity-60"
        >
          {pending ? 'Generando…' : 'Restablecer su contraseña'}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      {state.password && (
        <div className="mt-4 rounded-lg bg-success/10 p-4" role="status">
          <p className="text-sm font-semibold text-success">
            Contraseña temporal de {fullName.split(' ')[0]}:
          </p>
          <p className="mt-1 select-all font-mono text-2xl font-bold tracking-wide text-navy-900">
            {state.password}
          </p>
          <p className="mt-2 text-sm text-navy-800">
            Pásasela y dile que la cambie desde <strong>Mi perfil</strong>. Su contraseña anterior
            ya no sirve.
          </p>
        </div>
      )}
    </section>
  )
}
