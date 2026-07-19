/**
 * Sube imágenes a la plataforma desde una carpeta.
 *
 *   npx tsx scripts/subir-imagenes.mjs <carpeta>
 *
 * Convierte a PNG lo que haga falta para que el nombre coincida con lo que dice
 * el Excel, y avisa si alguna es demasiado pequeña para leerse.
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { Jimp } from 'jimp'
import fs from 'node:fs'
import path from 'node:path'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client.ts'
import { MIN_WIDTH_INFOGRAPHIC } from '../src/lib/image-size.ts'

const dir = process.argv[2]
if (!dir) {
  console.error('Uso: npx tsx scripts/subir-imagenes.mjs <carpeta>')
  process.exit(1)
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

// Los nombres que las preguntas esperan, según lo que guardó el importador.
const esperadas = new Set(
  (
    await db.questionVersion.findMany({
      where: { imageUrl: { not: null } },
      select: { imageUrl: true },
    })
  )
    .map((v) => v.imageUrl.split('/').pop())
    .filter(Boolean),
)
console.log('Las preguntas esperan:', [...esperadas].join(', '), '\n')

const files = fs
  .readdirSync(dir)
  .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))

for (const file of files) {
  const full = path.join(dir, file)
  const image = await Jimp.read(full)
  const { width, height } = image.bitmap

  // Si el Excel pide un .png y el archivo es .jpg, se convierte: así el nombre
  // coincide y la pregunta encuentra su gráfica.
  const base = file.replace(/\.[^.]+$/, '')
  const wantsPng = esperadas.has(`${base}.png`)
  const filename = wantsPng ? `${base}.png` : file
  const mimeType = filename.toLowerCase().endsWith('.png')
    ? 'image/png'
    : /\.jpe?g$/i.test(filename)
      ? 'image/jpeg'
      : 'image/webp'

  const data = Buffer.from(
    await image.getBuffer(mimeType === 'image/png' ? 'image/png' : 'image/jpeg'),
  )

  await db.upload.upsert({
    where: { filename },
    create: { filename, mimeType, bytes: data.length, data },
    update: { mimeType, bytes: data.length, data },
  })

  const aviso = width < MIN_WIDTH_INFOGRAPHIC ? `  ⚠ solo ${width}px de ancho: puede ser ilegible` : ''
  const convertida = filename !== file ? `  (convertida desde ${path.extname(file)})` : ''
  console.log(`✔ ${filename}  ${width}x${height}  ${Math.round(data.length / 1024)} KB${convertida}${aviso}`)
}

// ¿Queda alguna sin subir?
const subidas = new Set((await db.upload.findMany({ select: { filename: true } })).map((u) => u.filename))
const faltan = [...esperadas].filter((n) => !subidas.has(n))
console.log(faltan.length ? `\n✗ FALTAN: ${faltan.join(', ')}` : '\n✔ Todas las imágenes que piden las preguntas están subidas.')

await db.$disconnect()
