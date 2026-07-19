'use client'

import { useActionState } from 'react'

import { registerAction, type AuthState } from '@/lib/auth/actions'

const initial: AuthState = { error: null }

const field = 'rounded-xl border border-brand-200 bg-brand-100/40 px-4 py-2.5 outline-none focus:border-brand-600'

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Código de acceso</span>
        <input
          name="accessCode"
          required
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="SORA-XXXX-XXXX"
          className={`${field} font-mono tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-600/60`}
        />
        <span className="text-xs text-muted-600">
          Te lo entrega SORA al inscribirte en el curso.
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Nombre completo</span>
        <input name="fullName" autoComplete="name" required className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Usuario</span>
        <input name="username" autoComplete="username" required className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Correo</span>
        <input name="email" type="email" autoComplete="email" required className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Contraseña</span>
        <input name="password" type="password" autoComplete="new-password" required minLength={8} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Repite la contraseña</span>
        <input name="confirm" type="password" autoComplete="new-password" required className={field} />
      </label>

      {state.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? 'Creando cuenta…' : 'Inscríbete'}
      </button>
    </form>
  )
}
