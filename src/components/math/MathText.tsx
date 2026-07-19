import katex from 'katex'

import { splitMath } from '@/lib/math-text'

/**
 * Muestra un texto que puede traer fórmulas escritas entre `$$...$$`.
 *
 * El texto normal se renderiza tal cual (React lo escapa). Cada fórmula se pasa
 * por KaTeX, que la convierte en matemática de verdad: fracciones apiladas,
 * raíces, exponentes. Con `throwOnError: false`, una fórmula mal escrita se
 * muestra en rojo con su código, para que el administrador vea el error en la
 * vista previa en vez de tumbar la página.
 *
 * Es isomorfo: KaTeX produce el mismo HTML en el servidor y en el navegador, así
 * que sirve igual en la vista del examen (cliente) y en el repaso (servidor).
 */
export function MathText({ text }: { text: string }) {
  const tokens = splitMath(text)

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === 'text') return <span key={i}>{token.value}</span>
        const html = katex.renderToString(token.value, {
          displayMode: token.display,
          throwOnError: false,
          output: 'html',
        })
        return (
          <span
            key={i}
            // HTML de KaTeX, no del usuario: con `trust: false` (por defecto) no
            // ejecuta comandos peligrosos. Es seguro inyectarlo.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })}
    </>
  )
}
