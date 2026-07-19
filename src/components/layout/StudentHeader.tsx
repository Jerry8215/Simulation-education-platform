import Image from 'next/image'

import { logoutAction } from '@/lib/auth/actions'
import { avatarThumb } from '@/lib/avatars'

/**
 * La cabecera del diseño: a la derecha, el avatar del estudiante con su nombre
 * y su rol. `slot` deja poner a la izquierda lo que cada pantalla necesite
 * (los botones de acción del panel, o la ruta de migas).
 */
export function StudentHeader({
  fullName,
  avatarKey,
  slot,
}: {
  fullName: string
  avatarKey: string
  slot?: React.ReactNode
}) {
  const firstName = fullName.split(' ')[0] ?? fullName

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-brand-200/60 pb-4">
      <div className="min-w-0">{slot}</div>

      <div className="flex items-center gap-3">
        {/* El avatar ya trae su propio círculo dibujado: sin ring, que se veía
            como un borde de más. */}
        <Image
          src={avatarThumb(avatarKey)}
          alt=""
          width={52}
          height={52}
          className="h-12 w-12 rounded-full"
        />
        <div className="leading-tight">
          <p className="font-semibold text-navy-900">{firstName}</p>
          <p className="text-sm text-brand-500">Estudiante</p>
        </div>
        <form action={logoutAction}>
          <button
            className="ml-2 rounded-lg border border-brand-200 px-3 py-1.5 text-sm text-navy-900 hover:bg-brand-100"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  )
}
