/**
 * Genera códigos de acceso desde la terminal, sin pasar por el panel.
 *
 *   npx tsx scripts/generar-codigo.mjs [cuántos] [nota]
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { randomInt } from 'node:crypto'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

const ALPHABET = '234679ACDEFGHJKMNPQRTUVWXYZ'
const group = () =>
  Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
const generate = () => `SORA-${group()}-${group()}`

const count = Number(process.argv[2] ?? 1)
const note = process.argv[3] ?? 'Generado para pruebas'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const codes = []
for (let i = 0; i < count; i++) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generate()
    try {
      await db.accessCode.create({ data: { code, note } })
      codes.push(code)
      break
    } catch {
      // colisión, se reintenta
    }
  }
}

console.log(`\n${codes.length} código(s) generado(s):\n`)
for (const c of codes) console.log(`   ${c}`)
console.log('')

await db.$disconnect()
