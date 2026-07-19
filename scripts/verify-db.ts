/**
 * Verifica contra la base real que la siembra quedó bien y que el login del
 * administrador funciona de punta a punta (hash + verificación).
 *
 *   npx tsx scripts/verify-db.ts
 */

import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client'

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

  const byArea = await db.competency.groupBy({ by: ['area'], _count: true })
  console.log('Competencias por área:')
  for (const row of byArea.sort((a, b) => a.area.localeCompare(b.area))) {
    console.log(`  ${row.area.padEnd(22)} ${row._count}`)
  }
  const total = byArea.reduce((sum, r) => sum + r._count, 0)
  console.log(`  total: ${total} ${total === 14 ? '✔' : '✗ (se esperaban 14)'}`)

  const email = process.env.SEED_ADMIN_EMAIL ?? 'sorapreicfes@gmail.com'
  const admin = await db.user.findUnique({ where: { email } })
  if (!admin) {
    console.log(`\nAdministrador: NO encontrado (${email}) ✗`)
  } else {
    console.log(`\nAdministrador: ${admin.email}`)
    console.log(`  rol: ${admin.role} ${admin.role === 'ADMIN' ? '✔' : '✗'}`)
    const pass = process.env.SEED_ADMIN_PASSWORD
    if (pass) {
      const ok = await bcrypt.compare(pass, admin.passwordHash)
      const wrong = await bcrypt.compare(pass + 'x', admin.passwordHash)
      console.log(`  la contraseña correcta entra:   ${ok ? 'sí ✔' : 'NO ✗'}`)
      console.log(`  una contraseña errada NO entra: ${!wrong ? 'correcto ✔' : 'FALLA ✗'}`)
    }
  }

  await db.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
