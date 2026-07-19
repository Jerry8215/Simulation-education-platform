/**
 * Los cinco personajes de SORA. El orden es el del diseño (página 7).
 *
 * `key` es lo que se guarda en User.avatarKey; nunca cambiar esas cadenas sin
 * migrar los usuarios existentes.
 */

export const AVATARS = [
  { key: 'estudiosito', name: 'estudiosito' },
  { key: 'gatonto', name: 'gatonto' },
  { key: 'miauricio', name: 'miauricio' },
  { key: 'perrezoso', name: 'perrezoso' },
  { key: 'conejorge', name: 'conejorge' },
] as const

export type AvatarKey = (typeof AVATARS)[number]['key']

const KEYS = new Set<string>(AVATARS.map((a) => a.key))

export function isAvatarKey(value: unknown): value is AvatarKey {
  return typeof value === 'string' && KEYS.has(value)
}

/** El retrato grande, para la pantalla de elección. */
export function avatarImage(key: string): string {
  const safe = isAvatarKey(key) ? key : 'miauricio'
  return `/assets/elige-avatar/${safe}-icon.png`
}

/** El icono pequeño, para la cabecera y el panel. */
export function avatarThumb(key: string): string {
  const safe = isAvatarKey(key) ? key : 'miauricio'
  return `/assets/dashboard/icons-pequenos/${safe}-icon.png`
}
