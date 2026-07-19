/** Qué imágenes esperan las preguntas cargadas, y si el archivo existe. */
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'node:fs'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const versions = await db.questionVersion.findMany({
  where: { imageUrl: { not: null } },
  select: { imageUrl: true, stem: true },
})

const porImagen = new Map()
for (const v of versions) {
  const list = porImagen.get(v.imageUrl) ?? []
  list.push(v.stem.slice(0, 55))
  porImagen.set(v.imageUrl, list)
}

if (porImagen.size === 0) {
  console.log('Ninguna pregunta espera imagen.')
} else {
  for (const [url, stems] of porImagen) {
    const ruta = `public${url}`
    const existe = fs.existsSync(ruta)
    console.log(`\n${url}`)
    console.log(`  archivo: ${existe ? 'EXISTE ✔' : 'FALTA ✗  -> guardar en ' + ruta}`)
    console.log(`  lo usan ${stems.length} preguntas:`)
    for (const s of stems) console.log(`    · ${s}…`)
  }
}

await db.$disconnect()
