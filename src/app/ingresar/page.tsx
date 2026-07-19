import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/LoginForm'
import { PublicFooter, PublicHeader } from '@/components/landing/PublicChrome'
import { getSession } from '@/lib/auth/session'

export const metadata = {
  title: 'Iniciar sesión — SORA PREICFES',
}

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ suspendido?: string }>
}) {
  // Si ya hay sesión, no tiene sentido mostrar el login.
  const session = await getSession()
  if (session) redirect(session.role === 'ADMIN' ? '/admin' : '/inicio')

  const { suspendido } = await searchParams

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <PublicHeader current="login" />

      <main className="flex flex-1 items-center justify-center p-4 py-14">
        <div className="w-full max-w-md rounded-card bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center">
            <Image src="/logo-sora.png" alt="" width={72} height={72} priority />
            <h1 className="mt-2 text-3xl font-bold text-navy-900">Iniciar Sesión</h1>
            <p className="mb-6 text-brand-500">¡Qué bueno tenerte de vuelta!</p>
          </div>

          {suspendido && (
            <p
              className="mb-5 rounded-lg bg-danger/10 p-3 text-center text-sm text-danger"
              role="alert"
            >
              Tu acceso fue suspendido. Comunícate con el administrador de SORA.
            </p>
          )}

          <LoginForm />

          <p className="mt-5 text-center text-sm text-muted-600">
            ¿Olvidaste tu contraseña? Escríbenos por WhatsApp al{' '}
            <a
              href="https://wa.me/573244162444"
              className="font-semibold text-brand-600 hover:underline"
            >
              324 4162444
            </a>{' '}
            y te damos una nueva.
          </p>

          <p className="mt-4 text-center text-sm text-muted-600">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-semibold text-brand-600 hover:underline">
              Inscríbete
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
