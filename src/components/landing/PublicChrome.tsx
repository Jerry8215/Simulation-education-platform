import Image from 'next/image'
import Link from 'next/link'

/**
 * La barra superior y el pie de la parte pública. Se comparten entre la
 * portada, el inicio de sesión y el registro, para que el visitante nunca
 * pierda la navegación ni el contacto de SORA.
 *
 * Los enlaces del menú apuntan a las secciones de la portada con ruta absoluta
 * ("/#planes"), así funcionan igual desde la portada que desde el login.
 */

const NAV = [
  { href: '/#inicio', label: 'Inicio' },
  { href: '/#sobre-sora', label: 'Sobre Sora' },
  { href: '/#planes', label: 'Planes' },
  { href: '/#contactanos', label: 'Contáctanos' },
]

export function PublicHeader({ current }: { current?: 'login' | 'registro' }) {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-200/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="Inicio de SORA">
          <Image
            src="/assets/home/logo-sora-esquina.png"
            alt="SORA"
            width={130}
            height={109}
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-navy-900 transition hover:text-brand-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/ingresar"
            aria-current={current === 'login' ? 'page' : undefined}
            className={`inline-flex h-10 min-w-[7.5rem] items-center justify-center rounded-xl border-2 border-brand-600 px-4 text-sm font-semibold transition ${
              current === 'login'
                ? 'bg-brand-600 text-white'
                : 'text-brand-600 hover:bg-brand-100'
            }`}
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/#contactanos"
            className="inline-flex h-10 min-w-[7.5rem] items-center justify-center rounded-xl border-2 border-navy-900 bg-navy-900 px-4 text-sm font-semibold text-white transition hover:border-brand-600 hover:bg-brand-600"
          >
            Inscríbete
          </Link>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="bg-navy-900 px-4 py-10 text-center">
      <Image
        src="/assets/dashboard/logo-sora.png"
        alt="SORA"
        width={140}
        height={140}
        className="mx-auto w-24"
      />
      <p className="mt-3 text-sm text-white/80">
        Si tienes preguntas o dudas, escríbenos a{' '}
        <a href="mailto:sorapreicfes@gmail.com" className="underline">
          sorapreicfes@gmail.com
        </a>
      </p>
      <p className="mt-3 text-xs text-white/60">
        © 2026 sorapreicfes.com. Todos los derechos reservados.
      </p>
    </footer>
  )
}
