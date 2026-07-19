import ExcelJS from 'exceljs'
import fs from 'fs'

const OUT = 'f:/diagram png/entregables/EJEMPLO_FORMULAS_SORA.xlsx'
fs.mkdirSync('f:/diagram png/entregables', { recursive: true })

const AZUL = 'FF0C3C6E'
const AZULCLARO = 'FFE8F0FA'
const AMARILLO = 'FFFFF4CE'

const wb = new ExcelJS.Workbook()
wb.creator = 'SORA PREICFES'

// ---------- Hoja: Preguntas (la única que necesita el importador) ----------
const ws = wb.addWorksheet('Preguntas', {
  properties: { tabColor: { argb: 'FF2E86DE' } },
  views: [{ state: 'frozen', ySplit: 1 }],
})
const cols = [
  ['area', 22],
  ['competencia', 34],
  ['simulacro', 16],
  ['taller', 16],
  ['id_contexto', 12],
  ['contexto', 30],
  ['enunciado', 60],
  ['opcion_a', 22],
  ['opcion_b', 22],
  ['opcion_c', 22],
  ['opcion_d', 22],
  ['respuesta_correcta', 10],
  ['peso', 8],
  ['imagen', 16],
  ['explicacion', 45],
]
ws.columns = cols.map(([key, width]) => ({ key, width }))
const head = ws.addRow(cols.map(([k]) => k))
head.height = 22
head.eachCell((c) => {
  c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } }
  c.alignment = { vertical: 'middle', horizontal: 'center' }
})

// Preguntas de ejemplo con fórmulas entre $$...$$. Se dejan sin simulacro ni
// taller: van al banco, así la clienta puede subirlas solo para ver la vista
// previa con las fórmulas ya dibujadas, sin publicar nada.
const preguntas = [
  [
    'Matemáticas', 'Interpretación y representación', '', '', '', '',
    'Observa la expresión $$\\frac{3}{4} + \\frac{1}{8}$$ y selecciona su resultado.',
    '$$\\frac{7}{8}$$', '$$\\frac{4}{12}$$', '$$\\frac{1}{2}$$', '$$\\frac{5}{8}$$',
    'A', '', '', 'Con común denominador 8: $$\\frac{6}{8} + \\frac{1}{8} = \\frac{7}{8}$$.',
  ],
  [
    'Matemáticas', 'Formulación y ejecución', '', '', '', '',
    'Resuelve la ecuación $$x^2 - 9 = 0$$. ¿Cuáles son los valores de x?',
    '$$x = \\pm 3$$', '$$x = 9$$', '$$x = \\pm 9$$', '$$x = 3$$',
    'A', '', '', 'Como $$x^2 = 9$$, entonces $$x = 3$$ o $$x = -3$$.',
  ],
  [
    'Matemáticas', 'Formulación y ejecución', '', '', '', '',
    'El valor de $$\\sqrt{144}$$ es:',
    '$$12$$', '$$14$$', '$$72$$', '$$\\sqrt{12}$$',
    'A', '', '', 'Porque $$12 \\times 12 = 144$$.',
  ],
  [
    'Matemáticas', 'Argumentación', '', '', '', '',
    'La fracción continua $$1 + \\cfrac{1}{1 + \\cfrac{1}{13}}$$ tiene un valor que está entre:',
    '$$1$$ y $$2$$', '$$0$$ y $$1$$', '$$2$$ y $$3$$', 'mayor que $$3$$',
    'A', '', '', 'Su valor es aproximadamente $$1{,}93$$, así que está entre 1 y 2.',
  ],
  [
    'Matemáticas', 'Interpretación y representación', '', '', '', '',
    'Un producto cuesta $12.000 y tiene un descuento de $$\\frac{1}{4}$$ de su valor. ¿Cuánto se descuenta?',
    '$3.000', '$4.000', '$6.000', '$1.200',
    'A', '', '', 'La cuarta parte de $12.000 es $3.000. (Fíjate que los precios con un solo $ se ven tal cual.)',
  ],
]

preguntas.forEach((p, i) => {
  const r = ws.addRow(p)
  r.eachCell({ includeEmpty: true }, (c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 ? AZULCLARO : 'FFF7FAFE' } }
    c.alignment = { vertical: 'top', wrapText: true }
    c.font = { size: 10 }
  })
  r.height = 42
})

// Nota: no se pone una fila de aviso en esta hoja porque el importador la leería
// como si fuera una pregunta. Las instrucciones van en la hoja "Cómo escribir
// fórmulas".

// ---------- Hoja: Cómo escribir fórmulas ----------
const guia = wb.addWorksheet('Cómo escribir fórmulas', { properties: { tabColor: { argb: AZUL } } })
guia.columns = [{ width: 4 }, { width: 48 }, { width: 60 }]
const filas = [
  ['T', 'CÓMO ESCRIBIR FÓRMULAS EN EL EXCEL', ''],
  ['', '', ''],
  ['', 'Envuelve la fórmula entre DOS signos de dólar a cada lado ($$...$$), como en LaTeX.', ''],
  ['', 'Los precios con un solo $ (por ejemplo $5.000) se quedan tal cual.', ''],
  ['', '', ''],
  ['H', 'Escribes en el Excel', 'Se ve como'],
  ['R', '$$\\frac{1}{13}$$', 'un tercio... la fracción 1 sobre 13, apilada'],
  ['R', '$$x^2$$', 'x al cuadrado'],
  ['R', '$$x_1$$', 'x con subíndice 1'],
  ['R', '$$\\sqrt{2}$$', 'raíz cuadrada de 2'],
  ['R', '$$\\frac{a+b}{c}$$', 'la fracción (a+b) sobre c'],
  ['R', '$$1 + \\cfrac{1}{1 + \\cfrac{1}{13}}$$', 'una fracción continua anidada'],
  ['R', '$$\\pm 3$$', 'más o menos 3'],
  ['R', '$$\\pi r^2$$', 'pi por r al cuadrado'],
  ['', '', ''],
  ['H', 'Consejo', ''],
  ['', 'Al subir el archivo en "Importar preguntas", la vista previa te muestra cada', ''],
  ['', 'pregunta como la verá el estudiante. Si una fórmula quedó mal escrita, se ve', ''],
  ['', 'en rojo: la corriges en el Excel y vuelves a subir. Nada se guarda hasta que confirmes.', ''],
]
filas.forEach(([tipo, b, c]) => {
  const r = guia.addRow(['', b, c])
  const cb = r.getCell(2)
  const cc = r.getCell(3)
  if (tipo === 'T') {
    cb.font = { bold: true, size: 15, color: { argb: AZUL } }
    r.height = 24
  } else if (tipo === 'H') {
    cb.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
    cc.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
    cb.fill = cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } }
    r.height = 20
  } else if (tipo === 'R') {
    cb.font = { name: 'Consolas', size: 11, color: { argb: 'FF0C3C6E' } }
    cc.font = { size: 11 }
    cb.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZULCLARO } }
  } else {
    cb.font = { size: 11 }
  }
  cb.alignment = { vertical: 'middle', wrapText: true }
  cc.alignment = { vertical: 'middle', wrapText: true }
})

await wb.xlsx.writeFile(OUT)
console.log('OK ->', OUT)
