import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { generateCode, normalizeCode } from './code-format'

describe('generateCode', () => {
  it('tiene el formato SORA-XXXX-XXXX', () => {
    assert.match(generateCode(), /^SORA-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })

  it('no usa caracteres que se confunden al dictarlos', () => {
    // El código se lee por WhatsApp o se dicta: 0/O, 1/I/L, 5/S y 8/B son
    // fuente de errores y llamadas de soporte.
    const AMBIGUOS = /[01ILOSB58]/
    for (let i = 0; i < 300; i++) {
      const cuerpo = generateCode().slice('SORA-'.length)
      assert.doesNotMatch(cuerpo, AMBIGUOS, `código con carácter ambiguo: ${cuerpo}`)
    }
  })

  it('no repite el mismo código', () => {
    const vistos = new Set(Array.from({ length: 500 }, generateCode))
    assert.equal(vistos.size, 500, 'los 500 códigos generados son distintos')
  })
})

describe('normalizeCode', () => {
  it('acepta el código en minúsculas', () => {
    assert.equal(normalizeCode('sora-ab23-cd47'), 'SORA-AB23-CD47')
  })

  it('acepta espacios sobrantes al copiar y pegar', () => {
    assert.equal(normalizeCode('  SORA-AB23-CD47  '), 'SORA-AB23-CD47')
  })

  it('quita los espacios que quedan al copiar de WhatsApp', () => {
    assert.equal(normalizeCode('SORA - AB23 - CD47'), 'SORA-AB23-CD47')
  })
})
