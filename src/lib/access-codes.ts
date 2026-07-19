import 'server-only'

import { db } from '@/lib/db'
import { generateCode, normalizeCode } from '@/lib/code-format'

/**
 * Códigos de acceso.
 *
 * Solo los estudiantes que pagaron el curso reciben uno. Sin código no hay
 * registro, y cada código sirve una sola vez: así el acceso queda atado a un
 * pago y no se puede compartir.
 *
 * El formato de los códigos vive en code-format.ts (puro, con pruebas).
 */

export { generateCode, normalizeCode }

/**
 * Crea `count` códigos nuevos. Reintenta si sale uno repetido: la probabilidad
 * es ínfima, pero la restricción de unicidad no perdona.
 */
export async function createCodes(count: number, note?: string): Promise<string[]> {
  const created: string[] = []
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode()
      try {
        await db.accessCode.create({ data: { code, note: note || null } })
        created.push(code)
        break
      } catch {
        // Colisión con uno existente: se intenta con otro.
      }
    }
  }
  return created
}

export type CodeCheck =
  | { ok: true; codeId: string }
  | { ok: false; reason: 'NOT_FOUND' | 'ALREADY_USED' }

/** ¿Este código existe y sigue sin usarse? */
export async function checkCode(raw: string): Promise<CodeCheck> {
  const found = await db.accessCode.findUnique({ where: { code: normalizeCode(raw) } })
  if (!found) return { ok: false, reason: 'NOT_FOUND' }
  if (found.usedAt) return { ok: false, reason: 'ALREADY_USED' }
  return { ok: true, codeId: found.id }
}
