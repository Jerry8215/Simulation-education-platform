/**
 * Siembra la base con lo mínimo para que la plataforma funcione:
 * las competencias oficiales del ICFES y un usuario administrador.
 *
 *   npm run db:seed
 *
 * Es idempotente: se puede correr varias veces sin duplicar nada.
 */

import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

import { PrismaClient, type Area } from '../src/generated/prisma/client'

/**
 * Las competencias oficiales del ICFES, con la redacción que usa el cliente en
 * su plantilla. El importador tolera que se escriban abreviadas y las registra
 * con el nombre oficial.
 */
const COMPETENCIAS: Array<{ area: Area; name: string }> = [
  { area: 'LECTURA_CRITICA', name: 'Identificar y entender los contenidos locales que conforman un texto.' },
  { area: 'LECTURA_CRITICA', name: 'Comprender cómo se articulan las partes de un texto para darle un sentido global.' },
  { area: 'LECTURA_CRITICA', name: 'Reflexionar a partir de un texto y evaluar su contenido.' },
  { area: 'MATEMATICAS', name: 'Interpretación y representación' },
  { area: 'MATEMATICAS', name: 'Formulación y ejecución' },
  { area: 'MATEMATICAS', name: 'Argumentación' },
  { area: 'SOCIALES_CIUDADANAS', name: 'Pensamiento social' },
  { area: 'SOCIALES_CIUDADANAS', name: 'Interpretación y análisis de perspectivas' },
  { area: 'SOCIALES_CIUDADANAS', name: 'Pensamiento reflexivo y sistémico' },
  { area: 'CIENCIAS_NATURALES', name: 'Uso comprensivo del conocimiento científico' },
  { area: 'CIENCIAS_NATURALES', name: 'Explicación de fenómenos' },
  { area: 'CIENCIAS_NATURALES', name: 'Indagación' },
  { area: 'INGLES', name: 'Habilidad para comunicarse a través de tareas cotidianas y sencillas (Avisos y descripciones).' },
  { area: 'INGLES', name: 'Habilidad para interactuar en conversaciones breves (Diálogos cotidianos).' },
  { area: 'INGLES', name: 'Habilidad para comprender y usar estructuras gramaticales en contextos específicos (Textos con espacios).' },
  { area: 'INGLES', name: 'Habilidad para extraer información explícita e implícita de textos escritos (Comprensión de lectura).' },
]

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Falta DATABASE_URL en .env')

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

  for (const competencia of COMPETENCIAS) {
    await db.competency.upsert({
      where: { area_name: { area: competencia.area, name: competencia.name } },
      create: competencia,
      update: {},
    })
  }
  console.log(`Competencias: ${COMPETENCIAS.length} aseguradas.`)

  const email = process.env.SEED_ADMIN_EMAIL ?? 'sorapreicfes@gmail.com'
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!password) {
    console.log('SEED_ADMIN_PASSWORD no está definido: no se creó el administrador.')
  } else {
    await db.user.upsert({
      where: { email },
      create: {
        email,
        username: 'admin',
        fullName: 'Administrador SORA',
        passwordHash: await bcrypt.hash(password, 12),
        role: 'ADMIN',
      },
      update: { role: 'ADMIN' },
    })
    console.log(`Administrador: ${email}`)
  }

  await db.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
