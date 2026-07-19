import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/generated/prisma/client'

/**
 * En desarrollo, Next recarga los módulos en cada cambio. Sin este singleton
 * abriríamos un pool de conexiones nuevo en cada recarga hasta agotar el límite
 * del plan gratuito de Neon.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Falta DATABASE_URL en el entorno.')

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
