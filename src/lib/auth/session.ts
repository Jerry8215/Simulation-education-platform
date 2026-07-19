import 'server-only'

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'sora_session'

const DAY = 60 * 60 * 24

/** Sin "Recordarme", la sesión dura un día; con él, un mes. */
const MAX_AGE_SECONDS = DAY
const MAX_AGE_REMEMBER = DAY * 30

export type SessionPayload = {
  userId: string
  role: 'STUDENT' | 'ADMIN'
}

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET debe existir y tener al menos 32 caracteres.')
  }
  return new TextEncoder().encode(value)
}

export async function signSession(payload: SessionPayload, maxAge = MAX_AGE_SECONDS): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret())
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    if (!payload.sub || (payload.role !== 'STUDENT' && payload.role !== 'ADMIN')) return null
    return { userId: payload.sub, role: payload.role }
  } catch {
    // Firma inválida, token expirado o manipulado. Todos son "no hay sesión".
    return null
  }
}

export async function createSessionCookie(
  payload: SessionPayload,
  { remember = false }: { remember?: boolean } = {},
): Promise<void> {
  // La caducidad del token y la de la cookie deben coincidir: si la cookie
  // durara más que el token, el usuario vería una sesión "viva" que el servidor
  // rechaza.
  const maxAge = remember ? MAX_AGE_REMEMBER : MAX_AGE_SECONDS
  const token = await signSession(payload, maxAge)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true, // el JavaScript de la página no puede leerla
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** La sesión del usuario actual, o null. Solo lee la cookie: no toca la base. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return token ? verifySession(token) : null
}
