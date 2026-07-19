'use client'

import { useActionState } from 'react'

import { submitLeadAction, type LeadState } from '@/app/contacto-actions'

const initial: LeadState = { ok: false, error: null }

const field =
  'w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 outline-none focus:border-brand-600'

const OPCIONES = [
  'Quiero inscribirme al curso',
  'Información sobre los planes',
  'Precios y formas de pago',
  'Otra pregunta',
]

export function LeadForm() {
  const [state, action, pending] = useActionState(submitLeadAction, initial)

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-success/10 p-6 text-center">
        <p className="text-lg font-bold text-success">¡Gracias! Ya tenemos tus datos.</p>
        <p className="mt-1 text-navy-800">
          Nuestro equipo te contactará pronto para contarte cómo inscribirte.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Nombre</span>
        <input name="name" autoComplete="name" required className={field} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">Número de celular</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="300 123 4567"
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-navy-900">¿Qué deseas conocer?</span>
        <select name="interest" required defaultValue="" className={field}>
          <option value="" disabled>
            Elige una opción
          </option>
          {OPCIONES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      {state.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
      >
        {pending ? 'Enviando…' : 'Enviar Mensaje'}
      </button>
    </form>
  )
}
