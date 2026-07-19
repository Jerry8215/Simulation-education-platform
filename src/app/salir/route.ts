import { NextResponse } from 'next/server'

import { SESSION_COOKIE } from '@/lib/auth/session'

/**
 * Cierra la sesión: borra la cookie y manda al login.
 *
 * Se usa cuando el guardia (`requireUser`) detecta que la cuenta fue suspendida
 * o borrada mientras el estudiante tenía la sesión abierta. No se puede borrar
 * la cookie durante el render de una página, pero un route handler sí puede, y
 * así se evita el rebote infinito entre la página protegida y el login (la
 * cookie seguía "viva" y el login lo devolvía adentro).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url)
  const suspended = url.searchParams.get('suspendido') === '1'
  const destination = new URL(suspended ? '/ingresar?suspendido=1' : '/ingresar', url.origin)

  const response = NextResponse.redirect(destination)
  response.cookies.delete(SESSION_COOKIE)
  return response
}
