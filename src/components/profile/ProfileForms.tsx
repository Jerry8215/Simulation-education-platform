'use client'

import Image from 'next/image'
import { useActionState, useState } from 'react'

import {
  changeAvatarAction,
  changePasswordAction,
  updateProfileAction,
  type ProfileState,
} from '@/app/perfil/actions'
import { AVATARS, avatarImage } from '@/lib/avatars'

const initial: ProfileState = { ok: false, error: null, message: null }

const field =
  'rounded-xl border border-brand-200 bg-canvas px-4 py-2.5 outline-none focus:border-brand-600'

function Feedback({ state }: { state: ProfileState }) {
  if (state.error) {
    return (
      <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
        {state.error}
      </p>
    )
  }
  if (state.ok && state.message) {
    return (
      <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success" role="status">
        ✔ {state.message}
      </p>
    )
  }
  return null
}

export function ProfileDataForm({
  fullName,
  email,
  username,
  targetScore,
}: {
  fullName: string
  email: string
  username: string
  targetScore: number
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-500">Nombre completo</span>
          <input name="fullName" defaultValue={fullName} required className={field} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-500">Usuario</span>
          <input
            defaultValue={username}
            disabled
            className={`${field} cursor-not-allowed opacity-60`}
          />
          <span className="text-xs text-muted-600">El usuario no se puede cambiar.</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-500">Correo</span>
          <input name="email" type="email" defaultValue={email} required className={field} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-500">Tu meta (de 100 a 500)</span>
          <input
            name="targetScore"
            type="number"
            min={100}
            max={500}
            defaultValue={targetScore}
            required
            className={field}
          />
          <span className="text-xs text-muted-600">
            El puntaje al que quieres llegar en el ICFES.
          </span>
        </label>
      </div>

      <Feedback state={state} />

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export function AvatarPicker({ current }: { current: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-brand-200 px-4 py-1.5 text-sm font-medium text-navy-900 hover:bg-brand-100"
      >
        {open ? 'Cancelar' : 'Cambiar avatar'}
      </button>

      {open && (
        <ul className="mt-4 flex flex-wrap gap-4">
          {AVATARS.map((avatar) => {
            const active = avatar.key === current
            return (
              <li key={avatar.key}>
                <form action={changeAvatarAction}>
                  <input type="hidden" name="avatarKey" value={avatar.key} />
                  <button
                    type="submit"
                    className="group flex flex-col items-center gap-1"
                    aria-current={active}
                  >
                    <span
                      className={`block overflow-hidden rounded-full ring-4 transition ${
                        active
                          ? 'ring-brand-600'
                          : 'ring-brand-200 group-hover:ring-brand-500'
                      }`}
                    >
                      <Image
                        src={avatarImage(avatar.key)}
                        alt={avatar.name}
                        width={90}
                        height={90}
                        className="h-16 w-16 transition group-hover:scale-105"
                      />
                    </span>
                    <span className="text-xs text-navy-900">{avatar.name}</span>
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-500">Contraseña actual</span>
          <input
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-500">Nueva contraseña</span>
          <input
            name="next"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-500">Repite la nueva</span>
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className={field}
          />
        </label>
      </div>

      <Feedback state={state} />

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-brand-200 px-6 py-2.5 font-semibold text-navy-900 hover:bg-brand-100 disabled:opacity-60"
      >
        {pending ? 'Cambiando…' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
