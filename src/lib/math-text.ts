/**
 * Parte un texto en trozos de texto normal y trozos de fórmula matemática.
 *
 * El administrador escribe las fórmulas en el Excel entre DOBLE signo de dólar,
 * como en LaTeX: `$$\frac{1}{13}$$`, `$$x^2 + 1$$`. El resto es texto corriente.
 *
 * POR QUÉ DOBLE DÓLAR Y NO SENCILLO. En Colombia el `$` es el signo de la
 * moneda: "cuesta $5.000". Con un solo dólar como marca de fórmula, una frase
 * como "el libro cuesta $5.000 y el cuaderno $3.500" tomaría " y el cuaderno "
 * como si fuera una ecuación. Exigir DOS dólares a cada lado quita el problema:
 * los precios llevan un solo `$` y nunca se confunden con una fórmula.
 */

export type MathToken =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean }

// $$...$$  — el contenido no puede contener otro `$`.
const DELIMITER = /\$\$([^$]+?)\$\$/g

export function splitMath(input: string): MathToken[] {
  const tokens: MathToken[] = []
  let lastIndex = 0

  for (const match of input.matchAll(DELIMITER)) {
    const content = match[1]!.trim()
    if (!content) continue
    const start = match.index

    if (start > lastIndex) {
      tokens.push({ type: 'text', value: input.slice(lastIndex, start) })
    }
    tokens.push({ type: 'math', value: content, display: false })
    lastIndex = start + match[0].length
  }

  if (lastIndex < input.length) {
    tokens.push({ type: 'text', value: input.slice(lastIndex) })
  }

  if (tokens.length === 0) return input ? [{ type: 'text', value: input }] : []

  // Si TODO el enunciado es una sola fórmula, se muestra en grande y centrada
  // (modo display). Si va incrustada en una frase, en línea, del tamaño del texto.
  const onlyMath =
    tokens.length === 1 && tokens[0]!.type === 'math'
  if (onlyMath) (tokens[0] as { display: boolean }).display = true

  return tokens
}

/** ¿El texto trae al menos una fórmula? Útil para no cargar KaTeX de gusto. */
export function hasMath(input: string): boolean {
  // Regex propia sin la bandera global: `.test()` sobre una global lleva estado
  // (lastIndex) entre llamadas y daría respuestas alternas.
  return /\$\$[^$]+?\$\$/.test(input)
}
