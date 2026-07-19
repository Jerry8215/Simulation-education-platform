import 'server-only'

import bcrypt from 'bcryptjs'

/**
 * 12 rondas: unos 250 ms por hash en hardware corriente. Suficiente para que un
 * ataque de diccionario sobre la base robada sea caro, y poco para que el
 * estudiante note el retraso al iniciar sesión.
 */
const ROUNDS = 12

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/**
 * Compara contra un hash falso cuando el usuario no existe.
 *
 * Sin esto, un inicio de sesión con correo inexistente respondería en 1 ms y uno
 * con correo real en 250 ms. Esa diferencia le permite a un atacante averiguar
 * qué correos están registrados en la plataforma sin adivinar una sola clave.
 */
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.7rBHiuFRHRTmVBmO6Kt5N6PVGrK/Kfy'

export async function fakeVerify(plain: string): Promise<void> {
  await bcrypt.compare(plain, DUMMY_HASH)
}
