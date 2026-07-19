// Borra los datos de prueba (preguntas, assessments, intentos) sin tocar
// competencias ni usuarios. Solo Prisma, sin imports de 'server-only'.
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

await db.attemptAnswer.deleteMany({})
await db.attemptAreaScore.deleteMany({})
await db.attempt.deleteMany({})
await db.assessmentQuestion.deleteMany({})
await db.assessment.deleteMany({})
await db.$executeRawUnsafe('UPDATE "Question" SET "currentVersionId" = NULL')
await db.questionVersion.deleteMany({})
await db.question.deleteMany({})
await db.context.deleteMany({})

console.log('Datos de prueba eliminados. Quedan intactas competencias y usuarios.')
await db.$disconnect()
