/**
 * Actualiza los nombres de las competencias a los oficiales del ICFES (los que
 * usa el cliente en su plantilla). No borra nada: renombra las existentes y
 * agrega las que falten.
 *
 *   npx tsx scripts/rename-competencies.mjs
 */
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

/** nombre viejo -> nombre oficial, por área. */
const RENAMES = [
  ['LECTURA_CRITICA', 'Identificar y entender contenidos locales', 'Identificar y entender los contenidos locales que conforman un texto.'],
  ['LECTURA_CRITICA', 'Comprender cómo se articulan las partes de un texto', 'Comprender cómo se articulan las partes de un texto para darle un sentido global.'],
  ['LECTURA_CRITICA', 'Reflexionar y evaluar a partir de un texto', 'Reflexionar a partir de un texto y evaluar su contenido.'],
  ['INGLES', 'Comprensión lectora', 'Habilidad para extraer información explícita e implícita de textos escritos (Comprensión de lectura).'],
  ['INGLES', 'Uso del lenguaje en contexto', 'Habilidad para comprender y usar estructuras gramaticales en contextos específicos (Textos con espacios).'],
]

/** Competencias que hay que asegurar que existan (se crean si faltan). */
const ENSURE = [
  ['INGLES', 'Habilidad para comunicarse a través de tareas cotidianas y sencillas (Avisos y descripciones).'],
  ['INGLES', 'Habilidad para interactuar en conversaciones breves (Diálogos cotidianos).'],
]

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

for (const [area, oldName, newName] of RENAMES) {
  const existing = await db.competency.findUnique({ where: { area_name: { area, name: oldName } } })
  if (!existing) {
    console.log(`  (ya renombrada o ausente) ${oldName.slice(0, 40)}…`)
    continue
  }
  await db.competency.update({ where: { id: existing.id }, data: { name: newName } })
  console.log(`  ✔ ${oldName.slice(0, 38)}… -> ${newName.slice(0, 45)}…`)
}

for (const [area, name] of ENSURE) {
  await db.competency.upsert({
    where: { area_name: { area, name } },
    create: { area, name },
    update: {},
  })
  console.log(`  + asegurada: ${name.slice(0, 55)}…`)
}

const total = await db.competency.count()
console.log(`\nCompetencias en la base: ${total}`)
for (const c of await db.competency.findMany({ orderBy: [{ area: 'asc' }, { name: 'asc' }] })) {
  console.log(`  ${c.area.padEnd(22)} ${c.name}`)
}

await db.$disconnect()
