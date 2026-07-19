'use client'

import { useActionState } from 'react'

import { generateCodesAction, type GenerateState } from '@/app/admin/codigos/actions'

const initial: GenerateState = { codes: [], error: null }

export function GenerateCodes() {
  const [state, formAction, pending] = useActionState(generateCodesAction, initial)

  return (
    <div className="rounded-card bg-card p-5 shadow-sm">
      <h2 className="font-semibold text-navy-900">Generar códigos</h2>
      <p className="mt-1 text-sm text-muted-600">
        Un código por estudiante que pagó. Cada uno sirve una sola vez.
      </p>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-navy-900">¿Cuántos?</span>
          <input
            type="number"
            name="count"
            defaultValue={1}
            min={1}
            max={100}
            className="w-24 rounded-lg border border-brand-200 px-3 py-2"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-navy-900">Nota (opcional)</span>
          <input
            name="note"
            placeholder="Ej: Grupo julio, pagos del 12"
            className="w-full rounded-lg border border-brand-200 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? 'Generando…' : 'Generar'}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      {state.codes.length > 0 && (
        <div className="mt-4 rounded-lg bg-success/10 p-4">
          <p className="text-sm font-semibold text-success">
            {state.codes.length} código{state.codes.length > 1 ? 's' : ''} generado
            {state.codes.length > 1 ? 's' : ''}. Cópialos y entrégalos a los estudiantes:
          </p>
          <pre className="mt-2 overflow-x-auto rounded bg-white p-3 font-mono text-sm text-navy-900">
            {state.codes.join('\n')}
          </pre>
        </div>
      )}
    </div>
  )
}
