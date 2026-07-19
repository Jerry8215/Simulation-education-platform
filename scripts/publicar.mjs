/** Publica todo lo que tenga preguntas. */
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const conPreguntas = await db.assessment.findMany({
  where: { questions: { some: {} }, published: false },
  select: { id: true, title: true },
})

for (const a of conPreguntas) {
  await db.assessment.update({ where: { id: a.id }, data: { published: true } })
  console.log(`✔ Publicado: ${a.title}`)
}

if (conPreguntas.length === 0) console.log('Nada que publicar.')

await db.$disconnect()
