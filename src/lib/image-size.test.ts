import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { readImageWidth } from './image-size'

/**
 * El lector de ancho existe para avisar cuando el administrador sube una
 * miniatura por error. Ya pasó: la infografía llegó a 115 px de ancho y sus
 * datos eran ilegibles en pantalla.
 */

/** Un PNG mínimo con el ancho y el alto que se le digan. */
function fakePng(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(33)
  buffer.writeUInt8(0x89, 0)
  buffer.write('PNG\r\n\n', 1, 'latin1')
  buffer.writeUInt32BE(13, 8) // longitud del IHDR
  buffer.write('IHDR', 12, 'latin1')
  buffer.writeUInt32BE(width, 16)
  buffer.writeUInt32BE(height, 20)
  return buffer
}

/** Un JPEG mínimo: SOI, un segmento cualquiera, y el SOF0 con las dimensiones. */
function fakeJpeg(width: number, height: number): Buffer {
  const parts: number[] = [0xff, 0xd8] // SOI

  // Un APP0 de relleno, para que el lector tenga que saltárselo.
  parts.push(0xff, 0xe0, 0x00, 0x04, 0x00, 0x00)

  // SOF0: marcador, longitud, precisión, alto, ancho.
  parts.push(0xff, 0xc0, 0x00, 0x11, 0x08)
  parts.push((height >> 8) & 0xff, height & 0xff)
  parts.push((width >> 8) & 0xff, width & 0xff)
  parts.push(0x03, 0x01, 0x11, 0x00)

  return Buffer.from(parts)
}

describe('readImageWidth', () => {
  it('lee el ancho de un PNG', () => {
    assert.equal(readImageWidth(fakePng(1200, 800)), 1200)
  })

  it('lee el ancho de un JPEG, saltándose los segmentos de en medio', () => {
    assert.equal(readImageWidth(fakeJpeg(1024, 768)), 1024)
  })

  it('reconoce la miniatura que mandó el cliente (115 px)', () => {
    // El caso real: magnitude_es_115_167.jpg. A ese ancho, una infografía es
    // ilegible, y por eso el panel avisa al subirla.
    assert.equal(readImageWidth(fakeJpeg(115, 167)), 115)
  })

  it('un archivo que no es imagen devuelve null en vez de romper', () => {
    assert.equal(readImageWidth(Buffer.from('esto no es una imagen')), null)
  })

  it('un archivo vacío no revienta', () => {
    assert.equal(readImageWidth(Buffer.alloc(0)), null)
  })
})
