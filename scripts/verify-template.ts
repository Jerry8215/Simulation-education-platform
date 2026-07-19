/**
 * Corre el importador contra un archivo Excel real y muestra lo que vería el
 * administrador en la vista previa. Lee las competencias de la base, para que
 * el resultado sea idéntico al de la plataforma.
 *
 *   npx tsx scripts/verify-template.ts "ruta/al/archivo.xlsx"
 */

import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client'
import { parseQuestions } from '../src/lib/import/parse-questions'
import { readQuestionRows } from '../src/lib/import/read-workbook'
import { AREA_LABELS, type Area } from '../src/lib/scoring'

async function loadCompetencias(): Promise<Array<{ area: Area; name: string }>> {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })
  const rows = await db.competency.findMany({ select: { area: true, name: true } })
  await db.$disconnect()
  return rows.map((r) => ({ area: r.area as Area, name: r.name }))
}

async function main() {
const file = process.argv[2]
if (!file) {
  console.error('Uso: npx tsx scripts/verify-template.ts <archivo.xlsx>')
  process.exit(1)
}

const rows = await readQuestionRows(file)
const { questions, issues, summary } = parseQuestions(rows, await loadCompetencias())

console.log(`\nArchivo: ${file}`)
console.log(`Filas de datos leídas: ${summary.totalRows}\n`)

console.log('--- Vista previa de las preguntas que se cargarían ---\n')
for (const q of questions) {
  console.log(`Fila ${q.rowNumber} · ${AREA_LABELS[q.area]} · peso ${q.weight}`)
  console.log(`  ${q.simulacro ?? q.taller ?? '(banco, sin asignar)'}`)
  if (q.contextText) console.log(`  Contexto ${q.contextKey}: ${q.contextText.slice(0, 70)}...`)
  else if (q.contextKey) console.log(`  Contexto ${q.contextKey} (heredado)`)
  console.log(`  ${q.stem}`)
  for (const key of ['A', 'B', 'C', 'D'] as const) {
    const mark = key === q.correctOption ? '✔' : ' '
    console.log(`    ${mark} ${key}. ${q.options[key]}`)
  }
  if (q.imageName) console.log(`  Imagen esperada: ${q.imageName}`)
  console.log()
}

if (issues.length > 0) {
  console.log('--- Hallazgos ---\n')
  for (const issue of issues) {
    const tag = issue.severity === 'error' ? 'ERROR  ' : 'REVISAR'
    const where = issue.column ? ` [${issue.column}]` : ''
    console.log(`${tag} fila ${issue.rowNumber}${where}: ${issue.message}`)
  }
  console.log()
}

console.log('--- Resumen ---')
console.log(`  Se cargarían:          ${questions.length}`)
console.log(`  Bloqueadas por error:  ${summary.withErrors}`)
console.log(`  Marcadas para revisar: ${summary.withWarnings}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
