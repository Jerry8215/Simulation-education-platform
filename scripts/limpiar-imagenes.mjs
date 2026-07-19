/** Borra las imágenes subidas. Útil para dejar la base limpia tras las pruebas. */
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const { count } = await db.upload.deleteMany({})
console.log(`Imágenes borradas: ${count}`)

await db.$disconnect()
