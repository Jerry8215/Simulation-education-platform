'use client'

import { useActionState, useState } from 'react'

import { uploadImageAction, type UploadState } from '@/app/admin/imagenes/actions'
import { MAX_MB, tooBigMessage } from '@/lib/upload-limits'

const initial: UploadState = { ok: false, error: null, filename: null, warning: null }

export function UploadImage() {
  const [state, action, pending] = useActionState(uploadImageAction, initial)
  /**
   * El peso se revisa aquí, al elegir el archivo. Si se dejara pasar, la
   * petición muere en el borde antes de llegar al servidor y el administrador
   * solo vería un "server error" sin explicación.
   */
  const [sizeError, setSizeError] = useState<string | null>(null)

  return (
    <div className="rounded-card bg-card p-5 shadow-sm">
      <h2 className="font-semibold text-navy-900">Subir una imagen</h2>
      <p className="mt-1 text-sm text-muted-600">
        La portada de un taller, la gráfica de una pregunta, un mapa. PNG, JPG, WEBP o GIF, hasta{' '}
        {MAX_MB}&nbsp;MB.
      </p>

      <form action={action} className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          required
          onChange={(e) => {
            const file = e.target.files?.[0]
            setSizeError(file ? tooBigMessage(file.size) : null)
          }}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:font-medium file:text-brand-600"
        />
        <button
          type="submit"
          disabled={pending || sizeError !== null}
          className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? 'Subiendo…' : 'Subir'}
        </button>
      </form>

      {sizeError && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {sizeError}
        </p>
      )}

      {!sizeError && state.error && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      {state.ok && state.filename && (
        <div className="mt-3 rounded-lg bg-success/10 p-3">
          <p className="text-sm font-semibold text-success">
            ✔ Subida: <code className="font-mono">{state.filename}</code>
          </p>
          <p className="mt-1 text-sm text-navy-800">
            Para usarla en una pregunta, escribe ese mismo nombre en la columna{' '}
            <strong>imagen</strong> de tu Excel.
          </p>
        </div>
      )}

      {state.warning && (
        <p className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning" role="status">
          ⚠ {state.warning}
        </p>
      )}
    </div>
  )
}
