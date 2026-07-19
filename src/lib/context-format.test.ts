import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { hasImageMarker, parseContext, splitOnImageMarker } from './context-format'

/** Una lectura del ICFES tal como llega del Excel, con sus párrafos. */
const LECTURA = [
  'RESPONDE LAS PREGUNTAS 4 Y 5 DE ACUERDO CON LA SIGUIENTE INFORMACIÓN',
  'Instinto en lugar de lógica',
  'Cuando llega la hora de poner sus huevos, la avispa Sphex construye una pequeña madriguera y sale en búsqueda de un grillo al cual paraliza.',
  'Por ejemplo, la rutina de la avispa consiste en llevar al grillo hacia la madriguera, dejarlo en la entrada, e ir adentro a revisar.',
  'Tomado y adaptado de: Woolridge, Dean E. (1963). The Machinery of the Brain, New York: McGraw-Hill, pp. 82-83.',
].join('\n\n')

describe('parseContext', () => {
  it('separa la instrucción, el título, los párrafos y la fuente', () => {
    const c = parseContext(LECTURA)

    assert.equal(c.instruction, 'RESPONDE LAS PREGUNTAS 4 Y 5 DE ACUERDO CON LA SIGUIENTE INFORMACIÓN')
    assert.equal(c.title, 'Instinto en lugar de lógica')
    assert.equal(c.paragraphs.length, 2)
    assert.match(c.paragraphs[0]!, /^Cuando llega la hora/)
    assert.match(c.source!, /^Tomado y adaptado de/)
  })

  it('reconoce "RESPONDA" además de "RESPONDE"', () => {
    const c = parseContext('RESPONDA LAS PREGUNTAS 1 A 6 DE ACUERDO CON LA INFORMACIÓN\n\nUn párrafo cualquiera del texto.')
    assert.match(c.instruction!, /^RESPONDA/)
    assert.equal(c.paragraphs.length, 1)
  })

  it('un texto sin instrucción ni fuente es solo párrafos', () => {
    const c = parseContext('Las abejas polinizan las flores.\n\nAmbas se benefician del proceso.')
    assert.equal(c.instruction, null)
    assert.equal(c.source, null)
    assert.equal(c.paragraphs.length, 2)
  })

  it('no confunde una frase larga con un título', () => {
    // Una frase que termina en punto es texto, no encabezado.
    const c = parseContext('Cuando llega la hora de poner sus huevos, la avispa construye.\n\nOtro párrafo.')
    assert.equal(c.title, null)
    assert.equal(c.paragraphs.length, 2)
  })

  it('reconoce "Fuente:" y "Adaptado de" como fuente', () => {
    assert.match(parseContext('Un texto.\n\nFuente: El Tiempo, 2024.').source!, /^Fuente/)
    assert.match(parseContext('Un texto.\n\nAdaptado de: Wikipedia.').source!, /^Adaptado/)
  })

  it('un contexto de un solo párrafo no se rompe', () => {
    const c = parseContext('Las abejas polinizan las flores mientras recogen néctar.')
    assert.equal(c.paragraphs.length, 1)
    assert.equal(c.title, null)
  })
})

describe('el texto del cliente, que viene todo pegado en una celda', () => {
  // El caso real: la instrucción, el texto y la fuente llegan en un solo bloque,
  // sin saltos de línea. Una versión anterior tomaba TODO el bloque por
  // "instrucción" y la lectura salía entera en mayúsculas y centrada.
  const PEGADO =
    'RESPONDE LAS PREGUNTAS 0 A 0 DE ACUERDO CON LA SIGUIENTE INFORMACIÓN ' +
    'La historia del arte. A mucha gente le gusta ver en los cuadros lo que también le gustaría ver en la realidad. ' +
    'Se trata de una preferencia perfectamente comprensible. ' +
    'Tomado de: Gombrich, E. H. (2003). La historia del arte. Madrid: Random House Mondadori.'

  it('la instrucción se recorta, no se traga el texto entero', () => {
    const c = parseContext(PEGADO)

    assert.match(c.instruction!, /^RESPONDE LAS PREGUNTAS 0 A 0/)
    assert.doesNotMatch(
      c.instruction!,
      /mucha gente/,
      'la instrucción no puede llevarse la lectura por delante',
    )
  })

  it('el cuerpo del texto queda como párrafo, no como instrucción', () => {
    const c = parseContext(PEGADO)

    assert.equal(c.paragraphs.length, 1)
    assert.match(c.paragraphs[0]!, /A mucha gente le gusta ver en los cuadros/)
    assert.doesNotMatch(c.paragraphs[0]!, /RESPONDE LAS PREGUNTAS/)
    assert.doesNotMatch(c.paragraphs[0]!, /Tomado de/)
  })

  it('la fuente se recorta del final', () => {
    const c = parseContext(PEGADO)
    assert.match(c.source!, /^Tomado de: Gombrich/)
  })

  it('sin párrafos separados no se inventa un título', () => {
    // "La historia del arte." parece un título, pero viene pegado al texto: en
    // ese caso es más seguro dejarlo dentro del párrafo que adivinar mal.
    const c = parseContext(PEGADO)
    assert.equal(c.title, null)
  })
})

describe('marca de imagen dentro del contexto', () => {
  it('reconoce [IMAGEN] y (IMAGEN), con o sin espacios y sin importar mayúsculas', () => {
    assert.equal(hasImageMarker('el texto [IMAGEN] sigue'), true)
    assert.equal(hasImageMarker('la gráfica: (imagen)'), true)
    assert.equal(hasImageMarker('con espacios [ IMAGEN ]'), true)
    assert.equal(hasImageMarker('sin ninguna marca'), false)
    assert.equal(hasImageMarker(null), false)
  })

  it('hasImageMarker no lleva estado entre llamadas', () => {
    assert.equal(hasImageMarker('x [IMAGEN] y'), true)
    assert.equal(hasImageMarker('x [IMAGEN] y'), true)
  })

  it('parte el texto en lo de antes y lo de después de la marca (texto–imagen–texto)', () => {
    const s = splitOnImageMarker('Observe la figura [IMAGEN] y responda la pregunta.')
    assert.deepEqual(s, { before: 'Observe la figura', after: 'y responda la pregunta.' })
  })

  it('texto–imagen: la marca al final deja el "después" vacío', () => {
    assert.deepEqual(splitOnImageMarker('Según la gráfica: (IMAGEN)'), {
      before: 'Según la gráfica:',
      after: '',
    })
  })

  it('imagen–texto: la marca al inicio deja el "antes" vacío', () => {
    assert.deepEqual(splitOnImageMarker('[IMAGEN] Con base en lo anterior…'), {
      before: '',
      after: 'Con base en lo anterior…',
    })
  })

  it('sin marca devuelve null', () => {
    assert.equal(splitOnImageMarker('un texto cualquiera'), null)
  })
})
