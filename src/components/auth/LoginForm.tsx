'use client'

import { useActionState, useState } from 'react'

import { loginAction, type AuthState } from '@/lib/auth/actions'

const initial: AuthState = { error: null }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Usuario</span>
        <input
          name="identifier"
          autoComplete="username"
          required
          className="rounded-xl border border-brand-200 bg-brand-100/40 px-4 py-2.5 outline-none focus:border-brand-600"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Contraseña</span>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-brand-200 bg-brand-100/40 px-4 py-2.5 pr-11 outline-none focus:border-brand-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-600"
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
      </label>

      {/* "Recordarme" del diseño: mantiene la sesión un mes en vez de un día. */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="remember"
          value="true"
          className="h-4 w-4 rounded border-brand-200 accent-brand-600"
        />
        <span className="text-sm text-muted-600">Recordarme</span>
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
        {pending ? 'Entrando…' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}
