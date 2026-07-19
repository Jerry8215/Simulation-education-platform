/**
 * El ancho de un PNG o un JPEG, leído de su cabecera. Sin librerías.
 *
 * Existe para avisar cuando el administrador sube una miniatura por error: ya
 * pasó una vez, con una infografía de 115 px de ancho cuyos datos eran
 * ilegibles en pantalla.
 *
 * Puro: sin base de datos ni servidor, para poder probarlo.
 */

/** Una infografía por debajo de este ancho no se puede leer. */
export const MIN_WIDTH_INFOGRAPHIC = 800

export function readImageWidth(buffer: Buffer): number | null {
  // PNG: el ancho va en el chunk IHDR, en el byte 16.
  if (buffer.length > 24 && buffer.toString('latin1', 1, 4) === 'PNG') {
    return buffer.readUInt32BE(16)
  }

  // JPEG: hay que recorrer los marcadores hasta encontrar el SOF.
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let i = 2
    while (i < buffer.length - 9) {
      if (buffer[i] !== 0xff) {
        i += 1
        continue
      }
      const marker = buffer[i + 1]!
      // SOF0..SOF15, saltando los que no llevan dimensiones.
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return buffer.readUInt16BE(i + 7)
      }
      i += 2 + buffer.readUInt16BE(i + 2)
    }
  }

  return null
}
