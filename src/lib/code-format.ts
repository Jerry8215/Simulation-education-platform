import { randomInt } from 'node:crypto'

/**
 * Formato de los códigos de acceso. Puro: sin base de datos, para poder probarlo.
 */

/**
 * Alfabeto sin caracteres que se confunden al dictar o copiar a mano: nada de
 * 0/O, 1/I/L, 5/S ni 8/B. El código se dicta por teléfono o se lee de un
 * WhatsApp, y cada confusión es una llamada de soporte.
 */
const ALPHABET = '23467 9ACDEFGHJKMNPQRTUVWXYZ'.replace(' ', '')

const GROUP_SIZE = 4
const GROUPS = 2 // SORA-XXXX-XXXX

function randomGroup(): string {
  let out = ''
  for (let i = 0; i < GROUP_SIZE; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return out
}

export function generateCode(): string {
  return ['SORA', ...Array.from({ length: GROUPS }, randomGroup)].join('-')
}

/** El estudiante lo copia como sea: en minúsculas, con espacios de más. */
export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}
