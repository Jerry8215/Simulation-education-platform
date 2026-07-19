'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  ContactoIcon,
  EstadisticasIcon,
  HomeIcon,
  PerfilIcon,
  ResultadosIcon,
  SimulacroIcon,
  TallerIcon,
} from '@/components/icons/NavIcons'

/**
 * La barra lateral azul del diseño (páginas 8 a 13): logo, navegación y la
 * tarjeta "SORA te acompaña" al pie.
 *
 * Los iconos son SVG, no los PNG del diseño: aquellos eran de 25 px y se veían
 * borrosos. En SVG son nítidos a cualquier tamaño.
 *
 * En móvil no hay espacio para la barra: se convierte en una barra inferior fija
 * con los mismos destinos.
 */

type NavLink = { href: string; label: string; Icon: (props: { className?: string }) => React.ReactElement }

const LINKS: NavLink[] = [
  { href: '/inicio', label: 'Inicio', Icon: HomeIcon },
  { href: '/simulacros', label: 'Simulacros', Icon: SimulacroIcon },
  { href: '/talleres', label: 'Talleres', Icon: TallerIcon },
  { href: '/resultados', label: 'Resultados', Icon: ResultadosIcon },
  { href: '/estadisticas', label: 'Estadísticas', Icon: EstadisticasIcon },
]

const FOOT_LINKS: NavLink[] = [
  { href: '/perfil', label: 'Mi perfil', Icon: PerfilIcon },
  { href: '/contacto', label: 'Contáctanos', Icon: ContactoIcon },
]

function isActive(pathname: string, href: string) {
  // /simulacros activa también /simulacro/<id> (la pantalla del examen).
  if (href === '/simulacros') return pathname.startsWith('/simulacro')
  if (href === '/inicio') return pathname === '/inicio'
  return pathname.startsWith(href)
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Barra lateral — desde tablet en adelante */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-navy-900 p-4 md:flex">
        <Link href="/inicio" className="flex flex-col items-center pb-4 pt-2">
          <Image src="/assets/dashboard/logo-sora.png" alt="SORA" width={80} height={80} priority />
        </Link>

        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <SidebarLink key={link.href} {...link} active={isActive(pathname, link.href)} />
          ))}
        </nav>

        <hr className="my-4 border-white/15" />

        <nav className="flex flex-col gap-1">
          {FOOT_LINKS.map((link) => (
            <SidebarLink key={link.href} {...link} active={isActive(pathname, link.href)} />
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <Image
            src="/assets/dashboard/barra-azul/sora-te-acompana.png"
            alt="SORA te acompaña. Cada paso te acerca más a tu mejor versión."
            width={220}
            height={220}
            className="w-full rounded-2xl"
          />
        </div>
      </aside>

      {/* Barra inferior — en móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-navy-900 px-1 py-1.5 md:hidden">
        {LINKS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] ${
                active ? 'bg-white/15 text-white' : 'text-white/70'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function SidebarLink({
  href,
  label,
  Icon,
  active,
}: NavLink & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition ${
        active ? 'bg-white text-navy-900' : 'text-white hover:bg-white/10'
      }`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      {label}
    </Link>
  )
}
