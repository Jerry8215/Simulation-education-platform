import Image from 'next/image'
import { redirect } from 'next/navigation'

import { chooseAvatarAction } from '@/app/elige-avatar/actions'
import { requireUser } from '@/lib/auth/require'
import { AVATARS, avatarImage } from '@/lib/avatars'
import { db } from '@/lib/db'

export default async function EligeAvatarPage() {
  const { userId } = await requireUser()
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } })

  // Solo la primera vez. Después se cambia desde Mi perfil.
  if (user.avatarChosen) redirect('/inicio')

  return (
    // min-h-dvh + py: centrado cuando cabe, pero si el contenido es más alto que
    // la pantalla (móviles bajos) se puede desplazar en vez de recortarse arriba.
    <main className="flex min-h-dvh flex-col items-center justify-center bg-navy-900 px-4 py-10">
      <h1 className="text-center text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-5xl">
        <span className="text-brand-300">¿Quién está</span> estudiando?
      </h1>
      <p className="mt-2 text-center text-base text-white sm:text-lg">
        elige tu avatar <span className="text-brand-300">para comenzar</span>
      </p>

      {/* Estilo Netflix: círculos grandes que crecen y se iluminan al pasar por
          encima, con el nombre debajo. Los cinco en línea SOLO cuando de verdad
          caben (lg): antes pasaban a 5 columnas desde 640px y se salían de la
          pantalla. El contenedor va centrado y con ancho máximo. */}
      <ul className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-2 place-items-center gap-x-6 gap-y-9 sm:mt-14 lg:grid-cols-5 lg:gap-6">
        {AVATARS.map((avatar, index) => (
          <li
            key={avatar.key}
            className={
              index === AVATARS.length - 1
                ? 'col-span-2 lg:col-span-1' // el quinto ocupa la fila entera y queda centrado hasta que caben los 5
                : ''
            }
          >
            <form action={chooseAvatarAction}>
              <input type="hidden" name="avatarKey" value={avatar.key} />
              <button
                type="submit"
                className="group flex flex-col items-center gap-3 focus:outline-none"
              >
                <span className="block overflow-hidden rounded-full ring-4 ring-brand-600 transition duration-200 ease-out group-hover:scale-110 group-hover:ring-8 group-hover:ring-white group-focus-visible:scale-110 group-focus-visible:ring-8 group-focus-visible:ring-white">
                  <Image
                    src={avatarImage(avatar.key)}
                    alt={avatar.name}
                    width={220}
                    height={220}
                    className="h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
                    priority
                  />
                </span>
                <span className="text-lg text-white/70 transition group-hover:text-white group-focus-visible:text-white sm:text-xl">
                  {avatar.name}
                </span>
              </button>
            </form>
          </li>
        ))}
      </ul>

      <Image src="/logo-sora.png" alt="SORA" width={56} height={56} className="mt-10 opacity-90" />
    </main>
  )
}
