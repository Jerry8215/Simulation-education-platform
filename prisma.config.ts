import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // `prisma generate` corre en el build (postinstall) y NO se conecta a la
    // base. Antes se usaba env('DATABASE_URL'), que LANZA si la variable falta,
    // y el build de Vercel se caía. Con process.env + un marcador de posición,
    // generate siempre funciona; en runtime la app usa la DATABASE_URL real (el
    // adaptador PrismaPg en lib/db.ts), y `migrate deploy` usa la de .env.
    url:
      process.env.DATABASE_URL ||
      'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
})
