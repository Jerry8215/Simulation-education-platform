import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import ExcelJS from 'exceljs'

import { readQuestionRows, WorkbookFormatError } from './read-workbook'

/** Construye un .xlsx en memoria con los encabezados y filas dados. */
async function makeWorkbook(headers: string[], rows: string[][]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Preguntas')
  ws.addRow(headers)
  for (const row of rows) ws.addRow(row)
  const arrayBuffer = await wb.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}

// Los encabezados exactos del cliente: con tildes, mayúsculas, sin peso ni
// explicación, en su orden.
const CLIENT_HEADERS = [
  'Área', 'Competencia', 'Simulacro', 'taller', 'id_contexto', 'Contexto',
  'Enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'respuesta_correcta', 'imagen',
]

const CLIENT_ROW = [
  'Lectura Crítica', 'Reflexionar y evaluar a partir de un texto', 'Simulacro 01', '', 'CTX1',
  'Un texto sobre pintura.', '¿Cuál título es el más adecuado?',
  'El mal gusto', 'El arte real', 'La belleza en el arte', 'Los pintores', 'C', '',
]

describe('el importador acepta el formato editado del cliente', () => {
  it('reconoce "Área" con tilde y mayúscula', async () => {
    const buffer = await makeWorkbook(CLIENT_HEADERS, [CLIENT_ROW])
    const rows = await readQuestionRows(buffer)
    assert.equal(rows.length, 1)
    assert.equal(rows[0]!.area, 'Lectura Crítica')
    assert.equal(rows[0]!.respuesta_correcta, 'C')
    assert.equal(rows[0]!.id_contexto, 'CTX1')
  })

  it('no exige las columnas que el cliente quitó (peso, explicación)', async () => {
    const buffer = await makeWorkbook(CLIENT_HEADERS, [CLIENT_ROW])
    const rows = await readQuestionRows(buffer)
    // Las columnas ausentes quedan como cadena vacía, no rompen la lectura.
    assert.equal(rows[0]!.peso, '')
    assert.equal(rows[0]!.explicacion, '')
  })

  it('acepta las columnas en cualquier orden', async () => {
    const reordered = [
      'Enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'respuesta_correcta',
      'Competencia', 'Área',
    ]
    const row = [
      '¿Pregunta?', 'a', 'b', 'c', 'd', 'B', 'Interpretación y representación', 'Matemáticas',
    ]
    const rows = await readQuestionRows(await makeWorkbook(reordered, [row]))
    assert.equal(rows.length, 1)
    assert.equal(rows[0]!.area, 'Matemáticas')
    assert.equal(rows[0]!.competencia, 'Interpretación y representación')
    assert.equal(rows[0]!.respuesta_correcta, 'B')
  })

  it('acepta "Valor" como sinónimo de peso y "respuesta" de respuesta_correcta', async () => {
    const headers = ['area', 'competencia', 'enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'respuesta', 'valor']
    const row = ['Inglés', 'Uso del lenguaje en contexto', '¿Q?', 'a', 'b', 'c', 'd', 'A', '2']
    const rows = await readQuestionRows(await makeWorkbook(headers, [row]))
    assert.equal(rows[0]!.respuesta_correcta, 'A')
    assert.equal(rows[0]!.peso, '2')
  })

  it('ignora columnas desconocidas sin quejarse', async () => {
    const headers = [...CLIENT_HEADERS, 'Nivel', 'Notas internas']
    const row = [...CLIENT_ROW, 'Difícil', 'cualquier cosa']
    const rows = await readQuestionRows(await makeWorkbook(headers, [row]))
    assert.equal(rows.length, 1)
    assert.equal(rows[0]!.area, 'Lectura Crítica')
  })

  it('conserva las preguntas escritas ENCIMA de la nota amarilla', async () => {
    // El cliente borró los ejemplos y escribió sus preguntas arriba, dejando la
    // nota al final. Antes se perdían todas: se asumía que lo anterior a la nota
    // eran ejemplos.
    const rows = await readQuestionRows(
      await makeWorkbook(CLIENT_HEADERS, [
        [...CLIENT_ROW.slice(0, 6), '¿Primera pregunta real?', 'a', 'b', 'c', 'd', 'A', ''],
        [...CLIENT_ROW.slice(0, 6), '¿Segunda pregunta real?', 'a', 'b', 'c', 'd', 'B', ''],
        ['⬆ Las 5 filas de arriba son EJEMPLOS. Bórrelas y escriba sus preguntas desde aquí.'],
      ]),
    )
    assert.equal(rows.length, 2, 'las dos preguntas de arriba se conservan')
    assert.equal(rows[0]!.enunciado, '¿Primera pregunta real?')
    assert.equal(rows[1]!.enunciado, '¿Segunda pregunta real?')
  })

  it('la nota amarilla nunca se toma por una pregunta', async () => {
    const rows = await readQuestionRows(
      await makeWorkbook(CLIENT_HEADERS, [
        ['⬆ Las 5 filas de arriba son EJEMPLOS. Bórrelas y escriba sus preguntas desde aquí.'],
        [...CLIENT_ROW.slice(0, 6), '¿Pregunta real?', 'a', 'b', 'c', 'd', 'A', ''],
      ]),
    )
    assert.equal(rows.length, 1)
    assert.equal(rows[0]!.enunciado, '¿Pregunta real?')
  })

  it('descarta las preguntas de muestra de la plantilla, estén donde estén', async () => {
    // Se reconocen por su enunciado, no por su posición.
    const ejemplo = [
      'Lectura Crítica', 'Reflexionar a partir de un texto y evaluar su contenido.', '', '', '', '',
      'La relación entre el pez payaso y la anémona, donde ambos se benefician, se denomina',
      'comensalismo', 'parasitismo', 'mutualismo', 'depredación', 'C', '',
    ]
    const rows = await readQuestionRows(
      await makeWorkbook(CLIENT_HEADERS, [
        ejemplo,
        [...CLIENT_ROW.slice(0, 6), '¿Pregunta real?', 'a', 'b', 'c', 'd', 'A', ''],
      ]),
    )
    assert.equal(rows.length, 1, 'la de muestra no entra al banco')
    assert.equal(rows[0]!.enunciado, '¿Pregunta real?')
  })

  it('ignora las filas fantasma que solo traen el área rellenada', async () => {
    // Al arrastrar el desplegable, el área queda escrita en decenas de filas
    // vacías. No son preguntas a medias: son filas vacías, y no deben producir
    // una avalancha de errores falsos.
    const fantasma = ['Lectura Crítica', '', '', '', '', '', '', '', '', '', '', '', '']
    const rows = await readQuestionRows(
      await makeWorkbook(CLIENT_HEADERS, [
        [...CLIENT_ROW.slice(0, 6), '¿Pregunta real?', 'a', 'b', 'c', 'd', 'A', ''],
        fantasma,
        fantasma,
        fantasma,
      ]),
    )
    assert.equal(rows.length, 1, 'solo la pregunta de verdad')
  })

  it('una pregunta incompleta SÍ se reporta: no se confunde con una fila fantasma', async () => {
    // Tiene enunciado pero le falta todo lo demás. Eso es un error real que el
    // administrador debe ver, no una fila para saltarse en silencio.
    const incompleta = ['Lectura Crítica', '', '', '', '', '', '¿Enunciado sin opciones?', '', '', '', '', '', '']
    const rows = await readQuestionRows(await makeWorkbook(CLIENT_HEADERS, [incompleta]))
    assert.equal(rows.length, 1)
    assert.equal(rows[0]!.enunciado, '¿Enunciado sin opciones?')
  })

  it('rechaza el archivo si falta una columna obligatoria', async () => {
    // Sin la columna de opciones no se puede armar una pregunta.
    const headers = ['area', 'competencia', 'enunciado', 'respuesta_correcta']
    const buffer = await makeWorkbook(headers, [['Inglés', 'x', 'y', 'A']])
    await assert.rejects(
      () => readQuestionRows(buffer),
      (error) => {
        assert.ok(error instanceof WorkbookFormatError)
        assert.match(error.message, /faltan columnas obligatorias/)
        assert.match(error.message, /opcion_a/)
        return true
      },
    )
  })

  it('rechaza un archivo sin la hoja "Preguntas"', async () => {
    const wb = new ExcelJS.Workbook()
    wb.addWorksheet('Otra')
    const buffer = Buffer.from(await wb.xlsx.writeBuffer())
    await assert.rejects(() => readQuestionRows(buffer), WorkbookFormatError)
  })
})
