import Image from 'next/image'

import { MathText } from '@/components/math/MathText'
import {
  parseContext,
  splitOnImageMarker,
  type ContextBlock as ContextData,
} from '@/lib/context-format'

export { parseContext }
export type { ContextData }

/**
 * La parte superior de una lectura: la instrucción en mayúsculas y, si el texto
 * los trae, el título y los párrafos justificados.
 *
 * La FUENTE ("Tomado de...") NO va aquí: se renderiza aparte, al final de todo,
 * porque es la fuente del texto O de la imagen, y en ambos casos debe quedar
 * debajo de lo que cita. Ver <ContextSource>.
 */
export function ContextIntro({
  context,
  imageUrl,
}: {
  context: ContextData
  /** La gráfica de la lectura. Se muestra donde el texto trae la marca [IMAGEN]. */
  imageUrl?: string | null
}) {
  const { instruction, title, paragraphs } = context

  // Si solo hay instrucción (una imagen que se cita, sin texto de lectura), no
  // hace falta el recuadro: la instrucción sola se muestra encima.
  const hasReading = title || paragraphs.length > 0

  if (!instruction && !hasReading) return null

  // La imagen se inserta en la PRIMERA marca [IMAGEN] que aparezca; de ahí en
  // adelante las demás marcas se tratan como texto normal (una lectura tiene una
  // sola gráfica).
  let imagePlaced = false

  return (
    <section className="mb-4 rounded-lg border border-brand-200 bg-white p-5 sm:p-6">
      {instruction && (
        <p
          className={`text-center text-sm font-bold uppercase leading-snug tracking-wide text-navy-900 ${
            hasReading ? 'mb-4' : ''
          }`}
        >
          {instruction}
        </p>
      )}

      {title && (
        <h3 className="mb-4 text-center text-lg font-bold text-navy-900">
          <MathText text={title} />
        </h3>
      )}

      <div className="flex flex-col gap-3">
        {paragraphs.map((paragraph, i) => {
          const split = imageUrl && !imagePlaced ? splitOnImageMarker(paragraph) : null
          if (split) {
            imagePlaced = true
            return (
              <div key={i} className="flex flex-col gap-3">
                {split.before && (
                  <p className="text-justify leading-relaxed text-navy-900">
                    <MathText text={split.before} />
                  </p>
                )}
                <ContextImage src={imageUrl!} />
                {split.after && (
                  <p className="text-justify leading-relaxed text-navy-900">
                    <MathText text={split.after} />
                  </p>
                )}
              </div>
            )
          }
          return (
            <p key={i} className="text-justify leading-relaxed text-navy-900">
              <MathText text={paragraph} />
            </p>
          )
        })}
      </div>
    </section>
  )
}

/**
 * La gráfica de una lectura, dentro del recuadro del contexto. Se puede abrir a
 * tamaño completo: una infografía trae texto pequeño y el estudiante necesita
 * ampliarla para responder.
 */
function ContextImage({ src }: { src: string }) {
  return (
    <figure className="my-1">
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="block rounded-lg ring-1 ring-brand-200 transition hover:ring-2 hover:ring-brand-500"
      >
        <Image
          src={src}
          alt="Gráfica de la lectura"
          width={1200}
          height={900}
          className="mx-auto max-h-[30rem] w-auto max-w-full rounded-lg"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </a>
      <figcaption className="mt-1 text-center text-xs text-brand-600">
        Toca la imagen para verla en grande
      </figcaption>
    </figure>
  )
}

/** La fuente, al pie: "Tomado y adaptado de: ...". Va debajo de lo que cita. */
export function ContextSource({ source }: { source: string | null }) {
  if (!source) return null
  return <p className="mb-4 mt-1 text-center text-xs italic text-muted-600">{source}</p>
}
