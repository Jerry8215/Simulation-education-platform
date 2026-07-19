import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseQuestions, type ParsedQuestion, type RawRow } from './parse-questions'
import type { Area } from '../scoring'

/**
 * El importador valida dos veces: una al mostrar la vista previa, y otra al
 * confirmar, reconstruyendo las filas desde el JSON que devuelve el navegador.
 *
 * Si esa reconstrucción olvida una columna, el dato se pierde en silencio: la
 * vista previa lo muestra, la carga lo descarta. Ya pasó con la columna
 * "imagen", y ocho preguntas quedaron sin su gráfica.
 *
 * Esta prueba fija la regla: lo que sale del validador tiene que poder volver a
 * entrar sin perder nada.
 */

const COMPETENCIAS: Array<{ area: Area; name: string }> = [
  { area: 'LECTURA_CRITICA', name: 'Identificar y entender los contenidos locales que conforman un texto.' },
  { area: 'MATEMATICAS', name: 'Interpretación y representación' },
]

const AREA_LABEL: Record<Area, string> = {
  LECTURA_CRITICA: 'Lectura Crítica',
  MATEMATICAS: 'Matemáticas',
  SOCIALES_CIUDADANAS: 'Sociales y Ciudadanas',
  CIENCIAS_NATURALES: 'Ciencias Naturales',
  INGLES: 'Inglés',
}

/** La misma reconstrucción que hace commitImportAction al confirmar la carga. */
function rebuild(q: ParsedQuestion): RawRow {
  return {
    rowNumber: q.rowNumber,
    area: AREA_LABEL[q.area],
    competencia: q.competencia,
    simulacro: q.simulacro ?? '',
    taller: q.taller ?? '',
    id_contexto: q.contextKey ?? '',
    contexto: q.contextText ?? '',
    enunciado: q.stem,
    opcion_a: q.options.A,
    opcion_b: q.options.B,
    opcion_c: q.options.C,
    opcion_d: q.options.D,
    respuesta_correcta: q.correctOption,
    peso: String(q.weight),
    parte: q.part,
    imagen_a: q.optionImages.A ?? '',
    imagen_b: q.optionImages.B ?? '',
    imagen_c: q.optionImages.C ?? '',
    imagen_d: q.optionImages.D ?? '',
    imagen: q.imageName ?? '',
    explicacion: q.explanation ?? '',
  }
}

const FILA: RawRow = {
  rowNumber: 2,
  area: 'Lectura Crítica',
  competencia: 'Identificar y entender los contenidos locales que conforman un texto.',
  simulacro: 'Simulacro 01',
  taller: '',
  id_contexto: 'CTX2',
  contexto: 'Una infografía sobre traumatismos viales.',
  enunciado: 'Según la infografía, ¿qué grupo tiene la mayor mortalidad?',
  opcion_a: 'a pie',
  opcion_b: 'en moto',
  opcion_c: 'en bicicleta',
  opcion_d: 'en carro',
  respuesta_correcta: 'B',
  peso: '2',
  imagen: 'traumatismo_vial_lecturacritica_01.png',
  explicacion: 'Los motociclistas son el 23%.',
}

describe('la carga confirmada no pierde ningún dato de la vista previa', () => {
  it('la pregunta sobrevive intacta al ir y volver del validador', () => {
    const primera = parseQuestions([FILA], COMPETENCIAS).questions[0]!
    const segunda = parseQuestions([rebuild(primera)], COMPETENCIAS).questions[0]!

    assert.deepEqual(segunda, primera, 'lo que se guarda es lo que se mostró en la vista previa')
  })

  it('el nombre de la imagen llega hasta el final', () => {
    // El bug real: la reconstrucción olvidaba la columna "imagen" y las
    // preguntas se cargaban sin su gráfica, sin avisar de nada.
    const primera = parseQuestions([FILA], COMPETENCIAS).questions[0]!
    assert.equal(primera.imageName, 'traumatismo_vial_lecturacritica_01.png')

    const segunda = parseQuestions([rebuild(primera)], COMPETENCIAS).questions[0]!
    assert.equal(
      segunda.imageName,
      'traumatismo_vial_lecturacritica_01.png',
      'la imagen no se puede perder al confirmar',
    )
  })

  it('el peso y la explicación tampoco se pierden', () => {
    const primera = parseQuestions([FILA], COMPETENCIAS).questions[0]!
    const segunda = parseQuestions([rebuild(primera)], COMPETENCIAS).questions[0]!

    assert.equal(segunda.weight, 2)
    assert.equal(segunda.explanation, 'Los motociclistas son el 23%.')
    assert.equal(segunda.contextKey, 'CTX2')
    assert.equal(segunda.contextText, 'Una infografía sobre traumatismos viales.')
  })

  it('las imágenes de las opciones (tablas) sobreviven a la confirmación', () => {
    const conImagenes = {
      ...FILA,
      opcion_a: '',
      opcion_b: '',
      imagen_a: 'tabla_a.png',
      imagen_b: 'tabla_b.png',
      respuesta_correcta: 'A',
    }
    const primera = parseQuestions([conImagenes], COMPETENCIAS).questions[0]!
    assert.equal(primera.optionImages.A, 'tabla_a.png')
    assert.equal(primera.optionImages.B, 'tabla_b.png')

    const segunda = parseQuestions([rebuild(primera)], COMPETENCIAS).questions[0]!
    assert.equal(segunda.optionImages.A, 'tabla_a.png', 'la imagen de la opción no se puede perder')
    assert.equal(segunda.optionImages.B, 'tabla_b.png')
  })

  it('la parte de la segunda sesión sobrevive a la confirmación', () => {
    // Mismo riesgo que la imagen: si la reconstrucción olvida "parte", todas las
    // preguntas caerían a la parte 1 y el simulacro de dos partes se rompería.
    const primera = parseQuestions([{ ...FILA, parte: '2' }], COMPETENCIAS).questions[0]!
    assert.equal(primera.part, 2)

    const segunda = parseQuestions([rebuild(primera)], COMPETENCIAS).questions[0]!
    assert.equal(segunda.part, 2, 'la parte no se puede perder al confirmar')
  })
})
