import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/generated/prisma/client'

/**
 * En desarrollo, Next recarga los módulos en cada cambio. Sin este singleton
 * abriríamos un pool de conexiones nuevo en cada recarga hasta agotar el límite
 * del plan gratuito de Neon.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Falta DATABASE_URL en el entorno.')

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

/**
 * El cliente se crea de forma PEREZOSA, en el primer uso real, no al importar
 * este módulo. Antes se creaba al importarlo, y como `createClient` exige
 * DATABASE_URL, el `next build` fallaba cuando la variable no estaba en el
 * entorno del build (justo lo que pasó en Vercel). Con la creación diferida, el
 * build importa `db` sin problema y la conexión solo se abre al ejecutar una
 * consulta, cuando DATABASE_URL sí está.
 */
function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient()
  return globalForPrisma.prisma
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop) as unknown
    // Los métodos ($transaction, $queryRaw…) se enlazan al cliente real para que
    // `this` sea correcto; los delegados de modelo (db.user…) se devuelven tal cual.
    return typeof value === 'function' ? value.bind(client) : value
  },
}) as PrismaClient
