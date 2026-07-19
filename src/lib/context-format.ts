/**
 * Da estructura al texto de contexto de una pregunta.
 *
 * En el ICFES, una lectura viene siempre con la misma forma: la instrucción
 * ("RESPONDA LAS PREGUNTAS 4 Y 5 DE ACUERDO CON LA SIGUIENTE INFORMACIÓN"), a
 * veces un título, los párrafos del texto, y al final la fuente ("Tomado y
 * adaptado de: ..."). En el Excel todo eso llega como un solo bloque, muchas
 * veces sin siquiera un salto de línea entre las partes.
 *
 * Aquí se recorta la instrucción del principio y la fuente del final, y lo que
 * queda en medio es el texto. Ojo: la instrucción se RECORTA, no se "detecta" —
 * una versión anterior la buscaba con una expresión que acababa reclamando el
 * bloque entero, y la lectura salía completa en mayúsculas y centrada.
 *
 * Puro: sin React, para poder probarlo.
 */

export type ContextBlock = {
  /** "RESPONDA LAS PREGUNTAS 4 Y 5 DE ACUERDO CON LA SIGUIENTE INFORMACIÓN" */
  instruction: string | null
  /** "Instinto en lugar de lógica" */
  title: string | null
  paragraphs: string[]
  /** "Tomado y adaptado de: Woolridge, Dean E. (1963)..." */
  source: string | null
}

/**
 * Marca que el administrador escribe en el texto del contexto para decir DÓNDE
 * va la gráfica: `[IMAGEN]` o `(IMAGEN)` (con o sin espacios, sin importar
 * mayúsculas). La imagen se muestra justo en ese punto —así una lectura puede
 * ser texto → imagen → texto, o texto → imagen, según dónde ponga la marca.
 */
export const IMAGE_MARKER = /[[(]\s*imagen\s*[\])]/i

export function hasImageMarker(text: string | null | undefined): boolean {
  // Sin bandera global: `.test()` no lleva estado entre llamadas.
  return !!text && IMAGE_MARKER.test(text)
}

/**
 * Parte un texto en lo que va ANTES y DESPUÉS de la primera marca de imagen.
 * Devuelve null si no hay marca. Los extremos vienen ya recortados.
 */
export function splitOnImageMarker(text: string): { before: string; after: string } | null {
  const m = text.match(IMAGE_MARKER)
  if (m?.index === undefined) return null
  return {
    before: text.slice(0, m.index).trim(),
    after: text.slice(m.index + m[0].length).trim(),
  }
}

/**
 * La instrucción del ICFES. Termina en "INFORMACIÓN", "TEXTO" o "GRÁFICA", y de
 * ahí en adelante empieza la lectura. El `?` la hace perezosa: corta en la
 * primera aparición, no en la última.
 */
const INSTRUCTION =
  /^\s*respond[ae]\s+las?\s+preguntas?[\s\S]{0,90}?(?:informaci[oó]n|texto|gr[aá]fica|infograf[ií]a)\s*[.:]?/i

/** La fuente al pie. Se lleva todo lo que venga desde ahí hasta el final. */
const SOURCE = /(?:^|\s)((?:tomado|tomada|adaptado|adaptada|fuente|recuperado)\b[\s\S]*)$/i

/**
 * Un título es una línea corta que no termina en punto: no es una frase del
 * texto, es un encabezado. Solo se busca cuando el texto trae párrafos
 * separados; si viene todo pegado, adivinarlo es arriesgado y se prefiere no
 * inventar.
 */
function looksLikeTitle(line: string): boolean {
  if (line.length > 70) return false
  if (/[.:;,]$/.test(line)) return false
  return line.split(/\s+/).length >= 2
}

export function parseContext(raw: string): ContextBlock {
  let rest = raw.trim()

  // 1. Recortar la instrucción del principio.
  let instruction: string | null = null
  const foundInstruction = rest.match(INSTRUCTION)
  if (foundInstruction) {
    instruction = foundInstruction[0].trim()
    rest = rest.slice(foundInstruction[0].length).trim()
  }

  // 2. Recortar la fuente del final.
  let source: string | null = null
  const foundSource = rest.match(SOURCE)
  if (foundSource?.[1]) {
    source = foundSource[1].trim()
    rest = rest.slice(0, rest.length - foundSource[1].length).trim()
  }

  // 3. Lo que queda son los párrafos.
  const parts = rest
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  let title: string | null = null
  const paragraphs: string[] = []

  for (const part of parts) {
    // El título, si lo hay, va antes de los párrafos, y solo cuando el texto
    // viene con sus párrafos separados.
    if (!title && paragraphs.length === 0 && parts.length > 1 && looksLikeTitle(part)) {
      title = part
      continue
    }
    paragraphs.push(part)
  }

  return { instruction, title, paragraphs, source }
}
