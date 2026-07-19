'use server'

import { z } from 'zod'

import { db } from '@/lib/db'

/**
 * El formulario "¡Te contactamos!" de la portada.
 *
 * Los mensajes se guardan en la base y el administrador los ve en su panel. Es
 * más fiable que mandar un correo: nada se pierde en la carpeta de spam, y
 * queda registro de a quién ya se contactó.
 */

export type LeadState = { ok: boolean; error: string | null }

const schema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Escribe un número de celular válido.')
    .regex(/^[\d\s+()-]+$/, 'El número solo puede tener dígitos, espacios y signos + ( ) -'),
  interest: z.string().trim().min(1, 'Elige qué deseas conocer.'),
})

export async function submitLeadAction(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    interest: formData.get('interest'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisa los datos.' }
  }

  await db.contactLead.create({ data: parsed.data })
  return { ok: true, error: null }
}
