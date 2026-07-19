import ExcelJS from 'exceljs';
import fs from 'fs';

const OUT = 'f:/diagram png/entregables/PLANTILLA_PREGUNTAS_SORA.xlsx';
fs.mkdirSync('f:/diagram png/entregables', { recursive: true });

const AREAS = ['Lectura Crítica', 'Matemáticas', 'Sociales y Ciudadanas', 'Ciencias Naturales', 'Inglés'];

const COMPETENCIAS = {
  'Lectura Crítica': ['Identificar y entender contenidos locales', 'Comprender cómo se articulan las partes de un texto', 'Reflexionar y evaluar a partir de un texto'],
  'Matemáticas': ['Interpretación y representación', 'Formulación y ejecución', 'Argumentación'],
  'Sociales y Ciudadanas': ['Pensamiento social', 'Interpretación y análisis de perspectivas', 'Pensamiento reflexivo y sistémico'],
  'Ciencias Naturales': ['Uso comprensivo del conocimiento científico', 'Explicación de fenómenos', 'Indagación'],
  'Inglés': ['Comprensión lectora', 'Uso del lenguaje en contexto'],
};

const wb = new ExcelJS.Workbook();
wb.creator = 'SORA PREICFES';

const AZUL = 'FF0C3C6E', AZULCLARO = 'FFE8F0FA', AMARILLO = 'FFFFF4CE';

// ---------- Hoja 1: Instrucciones ----------
const ins = wb.addWorksheet('Instrucciones', { properties: { tabColor: { argb: AZUL } } });
ins.columns = [{ width: 4 }, { width: 110 }];
const lines = [
  ['T', 'PLANTILLA DE PREGUNTAS — SORA PREICFES'],
  ['', ''],
  ['H', 'Cómo usar esta plantilla'],
  ['', '1. Escriba una pregunta por fila en la hoja "Preguntas". No cambie el orden ni el nombre de las columnas.'],
  ['', '2. Las columnas Área y Competencia tienen lista desplegable. Use solo esos valores.'],
  ['', '3. La columna "respuesta_correcta" debe ser exactamente A, B, C o D (una sola letra, en mayúscula).'],
  ['', '4. Toda pregunta necesita las cuatro opciones (A, B, C, D). Ninguna puede quedar vacía.'],
  ['', '5. La columna "peso" es opcional. Si la deja en blanco, la pregunta vale 1. Úsela solo si quiere que'],
  ['', '   una pregunta valga más que otra dentro del mismo simulacro.'],
  ['', '6. Si varias preguntas comparten un texto o gráfica (contexto), repita el mismo "id_contexto" en todas'],
  ['', '   ellas y escriba el texto una sola vez en la columna "contexto". Deje "contexto" vacío en las demás.'],
  ['', '7. Si una pregunta necesita una imagen, escriba el nombre del archivo en "imagen" (ej: mapa_01.png) y'],
  ['', '   envíeme las imágenes en una carpeta aparte.'],
  ['', ''],
  ['H', 'Sobre el texto que viene del OCR'],
  ['', 'Antes de pegar, revise que las tildes y las eñes se vean bien (á é í ó ú ñ) y que no haya letras'],
  ['', 'cambiadas por números: la "O" convertida en "0", la "l" en "1", la "I" en "l".'],
  ['', 'Revise también los símbolos matemáticos y las fórmulas: son lo que el OCR peor reconoce.'],
  ['', 'No se preocupe por atraparlo todo. Al cargar el archivo, la plataforma le mostrará una vista previa de'],
  ['', 'cada pregunta como la verá el estudiante, y le marcará las que tengan problemas para que las corrija ahí.'],
  ['', ''],
  ['H', 'Reglas importantes'],
  ['', '• No borre ni renombre las columnas, ni agregue columnas nuevas.'],
  ['', '• No use saltos de línea dentro de una celda (Alt+Enter). Escriba el enunciado corrido.'],
  ['', '• Puede dejar "simulacro" o "taller" vacío: son preguntas del banco, listas para asignarse después.'],
  ['', '• Una pregunta pertenece a un simulacro o a un taller, no a los dos.'],
  ['', '• Guarde el archivo como .xlsx (no como .csv) para no perder las tildes.'],
  ['', ''],
  ['H', 'Lo que necesito primero'],
  ['', 'Con 15 o 20 preguntas reales me basta para probar el importador contra sus casos verdaderos.'],
  ['', 'Ideal si vienen de áreas distintas y si al menos una tiene contexto compartido y otra tiene imagen:'],
  ['', 'así verifico los casos difíciles desde el primer día.'],
  ['', ''],
  ['H', 'Las competencias válidas de cada área están en la hoja "Áreas y Competencias".'],
];
lines.forEach(([tipo, txt]) => {
  const r = ins.addRow(['', txt]);
  const c = r.getCell(2);
  if (tipo === 'T') { c.font = { bold: true, size: 16, color: { argb: AZUL } }; r.height = 26; }
  else if (tipo === 'H') { c.font = { bold: true, size: 12, color: { argb: AZUL } }; r.height = 20; }
  else c.font = { size: 11 };
  c.alignment = { vertical: 'middle' };
});

// ---------- Hoja 2: Preguntas ----------
const ws = wb.addWorksheet('Preguntas', { properties: { tabColor: { argb: 'FF2E86DE' } }, views: [{ state: 'frozen', ySplit: 1 }] });
const cols = [
  ['area', 22], ['competencia', 34], ['simulacro', 16], ['taller', 16],
  ['id_contexto', 12], ['contexto', 40], ['enunciado', 55],
  ['opcion_a', 26], ['opcion_b', 26], ['opcion_c', 26], ['opcion_d', 26],
  ['respuesta_correcta', 10], ['peso', 8], ['imagen', 18], ['explicacion', 45],
];
ws.columns = cols.map(([key, width]) => ({ key, width }));
const head = ws.addRow(cols.map(([k]) => k));
head.height = 22;
head.eachCell(c => {
  c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  c.alignment = { vertical: 'middle', horizontal: 'center' };
  c.border = { bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
});

const ejemplos = [
  ['Lectura Crítica', 'Comprender cómo se articulan las partes de un texto', 'Simulacro 01', '', 'CTX1',
    'El texto habla de la relación entre las abejas y las flores. Ambas se benefician: la abeja obtiene néctar y la flor es polinizada.',
    'Según el texto, la relación entre la abeja y la flor se describe como una relación en la que',
    'solo la abeja obtiene un beneficio', 'ambas partes obtienen un beneficio', 'la flor resulta perjudicada', 'ninguna obtiene beneficio',
    'B', 1, '', 'El texto dice explícitamente que ambas se benefician.'],
  ['Lectura Crítica', 'Reflexionar y evaluar a partir de un texto', 'Simulacro 01', '', 'CTX1',
    '', 'A partir del texto anterior, se puede inferir que la desaparición de las abejas afectaría principalmente',
    'la reproducción de las plantas con flor', 'la temperatura del planeta', 'la calidad del agua', 'la erosión del suelo',
    'A', 2, '', 'Si la abeja poliniza, su ausencia afecta la reproducción de la flor.'],
  ['Matemáticas', 'Interpretación y representación', 'Simulacro 01', '', '', '',
    'Según la gráfica, ¿en qué mes se registró la mayor cantidad de lluvia?',
    'Marzo', 'Junio', 'Septiembre', 'Diciembre', 'C', 1, 'grafica_lluvia.png', 'La barra más alta corresponde a septiembre.'],
  ['Ciencias Naturales', 'Explicación de fenómenos', '', 'Taller 1 - Relaciones Simbióticas', '', '',
    'La relación entre el pez payaso y la anémona, donde ambos se benefician, se denomina',
    'comensalismo', 'parasitismo', 'mutualismo', 'depredación', 'C', 1, '', 'Ambos organismos se benefician: es mutualismo.'],
  ['Inglés', 'Uso del lenguaje en contexto', '', '', '', '',
    'Choose the option that best completes the sentence: "If I ____ more time, I would travel."',
    'have', 'had', 'will have', 'having', 'B', 1, '', 'Segundo condicional: If + pasado simple.'],
];
ejemplos.forEach((e, i) => {
  const r = ws.addRow(e);
  r.eachCell({ includeEmpty: true }, c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 ? AZULCLARO : 'FFF7FAFE' } };
    c.alignment = { vertical: 'top', wrapText: true };
    c.font = { size: 10, italic: true, color: { argb: 'FF666666' } };
  });
  r.height = 46;
});
const nota = ws.addRow(['⬆ Las 5 filas de arriba son EJEMPLOS. Bórrelas y escriba sus preguntas desde aquí.']);
nota.getCell(1).font = { bold: true, color: { argb: 'FFB35C00' } };
ws.mergeCells(`A${nota.number}:O${nota.number}`);
nota.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AMARILLO } };
nota.getCell(1).alignment = { horizontal: 'center' };

// Validaciones (filas 2..2000)
const allComp = [...new Set(Object.values(COMPETENCIAS).flat())];
for (let row = 2; row <= 2000; row++) {
  ws.getCell(`A${row}`).dataValidation = { type: 'list', allowBlank: false, formulae: [`"${AREAS.join(',')}"`], showErrorMessage: true, errorTitle: 'Área inválida', error: 'Elija un área de la lista.' };
  ws.getCell(`L${row}`).dataValidation = { type: 'list', allowBlank: false, formulae: ['"A,B,C,D"'], showErrorMessage: true, errorTitle: 'Respuesta inválida', error: 'Debe ser A, B, C o D.' };
  ws.getCell(`M${row}`).dataValidation = { type: 'whole', operator: 'between', formulae: [1, 10], allowBlank: true, showErrorMessage: true, errorTitle: 'Peso inválido', error: 'El peso es un número entre 1 y 10. Déjelo vacío para usar 1.' };
  ws.getCell(`B${row}`).dataValidation = { type: 'list', allowBlank: false, formulae: [`'Áreas y Competencias'!$B$2:$B$${allComp.length + 1}`], showErrorMessage: true, errorTitle: 'Competencia inválida', error: 'Use una competencia de la hoja "Áreas y Competencias", y que corresponda al área elegida.' };
}
ws.autoFilter = 'A1:O1';

// ---------- Hoja 3: Áreas y Competencias ----------
const ac = wb.addWorksheet('Áreas y Competencias', { properties: { tabColor: { argb: 'FF7DA7D9' } } });
ac.columns = [{ header: 'area', key: 'a', width: 26 }, { header: 'competencia', key: 'c', width: 52 }];
ac.getRow(1).eachCell(c => {
  c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
});
Object.entries(COMPETENCIAS).forEach(([a, cs]) => cs.forEach(c => ac.addRow([a, c])));

await wb.xlsx.writeFile(OUT);
console.log('OK ->', OUT);
