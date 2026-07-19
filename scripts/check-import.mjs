import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const questions = await db.question.count()
const versions = await db.questionVersion.count()
const withoutCurrent = await db.question.count({ where: { currentVersionId: null } })
const contexts = await db.context.count()

console.log('Preguntas:', questions)
console.log('Versiones:', versions)
console.log('Preguntas sin versión vigente:', withoutCurrent, withoutCurrent === 0 ? '✔' : '✗')
console.log('Contextos:', contexts)

const assessments = await db.assessment.findMany({
  include: { _count: { select: { questions: true } } },
})
console.log('\nAssessments armados:')
for (const a of assessments) {
  console.log(`  [${a.type}] ${a.title} — ${a._count.questions} preguntas, ${a.durationMinutes ?? 'sin'} min`)
}

// Comprobación clave de seguridad: la respuesta correcta existe en la versión
// pero NO debe filtrarse en ninguna consulta de estudiante. Aquí solo la contamos.
const sample = await db.questionVersion.findFirst({ select: { stem: true, correctOption: true } })
console.log('\nEjemplo (lado servidor):', sample?.stem?.slice(0, 40), '-> correcta:', sample?.correctOption)

await db.$disconnect()
