import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

import { SESSION_COOKIE } from '@/lib/auth/session'

/**
 * Protección de rutas. En Next 16 el antiguo `middleware` se llama `proxy` y
 * corre en el runtime de Node.
 *
 * Aquí solo se verifica la firma de la cookie de sesión, sin tocar la base de
 * datos: es un filtro barato en el borde. La autorización fina (¿este intento
 * es de este estudiante?) la hace cada página con los datos reales.
 */

const STUDENT_PREFIXES = [
  '/inicio', '/simulacros', '/talleres', '/resultados', '/estadisticas',
  '/perfil', '/simulacro', '/elige-avatar', '/contacto',
]
const ADMIN_PREFIXES = ['/admin']

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

async function readSession(request: NextRequest): Promise<{ role: string } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    return { role: typeof payload.role === 'string' ? payload.role : '' }
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsAdmin = ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const needsStudent = STUDENT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (!needsAdmin && !needsStudent) return NextResponse.next()

  const session = await readSession(request)

  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/ingresar'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (needsAdmin && session.role !== 'ADMIN') {
    const url = request.nextUrl.clone()
    url.pathname = '/inicio'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Se salta archivos estáticos y de imagen para no filtrar cada asset.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo-sora.png|assets).*)'],
}
