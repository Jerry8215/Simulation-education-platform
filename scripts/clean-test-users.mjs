/**
 * Borra las cuentas de prueba (@sora.test) y sus intentos, dejando intactas las
 * preguntas, los simulacros y las cuentas reales.
 *
 *   npx tsx scripts/clean-test-users.mjs
 */
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const testers = await db.user.findMany({
  where: { email: { endsWith: '@sora.test' } },
  select: { id: true, email: true },
})

if (testers.length === 0) {
  console.log('No hay cuentas de prueba.')
} else {
  const ids = testers.map((u) => u.id)
  // Los intentos y respuestas caen con el usuario (onDelete: Cascade).
  const { count } = await db.user.deleteMany({ where: { id: { in: ids } } })
  console.log(`Borradas ${count} cuentas de prueba:`)
  for (const t of testers) console.log(`  ${t.email}`)
}

const questions = await db.question.count()
const assessments = await db.assessment.count()
const realUsers = await db.user.count()
console.log(`\nQuedan: ${questions} preguntas, ${assessments} simulacros/talleres, ${realUsers} usuarios.`)

await db.$disconnect()
