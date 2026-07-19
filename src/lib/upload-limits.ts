/**
 * El tope de peso de una subida, en un módulo puro para que lo puedan usar tanto
 * el servidor (al guardar) como el navegador (al elegir el archivo).
 *
 * POR QUÉ ESTE NÚMERO. Una función serverless en Vercel solo recibe 4.5 MB de
 * cuerpo, y el `multipart/form-data` suma unos KB de bordes y cabeceras encima
 * del archivo. Con 4 MB queda holgura de sobra.
 *
 * POR QUÉ TAMBIÉN SE REVISA EN EL NAVEGADOR. Si el archivo se manda igual, la
 * petición muere en el borde —antes de llegar al código— y el administrador solo
 * ve un "server error" sin explicación. Revisando aquí primero, ve un mensaje
 * claro y ni siquiera se sube nada.
 */

export const MAX_BYTES = 4 * 1024 * 1024

export const MAX_MB = MAX_BYTES / 1024 / 1024

/** "3.8 MB" — para decirle al administrador cuánto pesa lo que eligió. */
export function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** El mensaje cuando el archivo se pasa de peso, o null si cabe. */
export function tooBigMessage(bytes: number): string | null {
  if (bytes <= MAX_BYTES) return null
  return (
    `La imagen pesa ${formatMb(bytes)} y el máximo es ${MAX_MB} MB. ` +
    'Redúcela (por ejemplo, exportándola más pequeña) y vuelve a intentar.'
  )
}
