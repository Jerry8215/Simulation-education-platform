import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { PublicFooter, PublicHeader } from '@/components/landing/PublicChrome'
import { getSession } from '@/lib/auth/session'

export const metadata = {
  title: 'Crea tu cuenta — SORA PREICFES',
}

export default async function RegistroPage() {
  const session = await getSession()
  if (session) redirect(session.role === 'ADMIN' ? '/admin' : '/inicio')

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <PublicHeader current="registro" />

      <main className="flex flex-1 items-center justify-center p-4 py-14">
        <div className="w-full max-w-md rounded-card bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center">
            <Image src="/logo-sora.png" alt="" width={64} height={64} priority />
            <h1 className="mt-2 text-2xl font-bold text-navy-900">Crea tu cuenta</h1>
            <p className="mb-6 text-brand-500">Empieza a prepararte para el ICFES</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-muted-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/ingresar" className="font-semibold text-brand-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
