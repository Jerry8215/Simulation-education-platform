/**
 * Los títulos decorados del diseño de Canva: una palabra grande sólo en
 * contorno, y encima —montada sobre ella— otra sólida y compacta.
 *
 * El efecto se hace con `-webkit-text-stroke`, que dibuja la letra hueca. No
 * hace falta ninguna imagen: sigue siendo texto, así que Google lo lee, se
 * puede seleccionar, y se adapta al ancho del celular.
 */

type Props = {
  /** La palabra grande y hueca, de fondo. Ej: "SORA". */
  outline: string
  /** La palabra sólida que va encima. Ej: "PRE ICFES". Puede no haberla. */
  solid?: string
  /** Una línea pequeña por encima de todo. Ej: "sobre". */
  eyebrow?: string
  /** El texto que va debajo del título. */
  children?: React.ReactNode
  /** Alineación: a la izquierda por defecto. */
  align?: 'left' | 'center'
  className?: string
}

export function StackedHeading({
  outline,
  solid,
  eyebrow,
  children,
  align = 'left',
  className = '',
}: Props) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      {eyebrow && (
        <span className="relative text-xl font-bold lowercase text-brand-600 sm:text-2xl">
          {eyebrow}
          <span className="absolute inset-x-0 -bottom-0.5 h-1 rounded-full bg-brand-500" />
        </span>
      )}

      {/* El título completo se lee como una sola frase; lo de dentro es decoración. */}
      <h2 className="relative">
        <span className="sr-only">
          {eyebrow ? `${eyebrow} ` : ''}
          {outline}
          {solid ? ` ${solid}` : ''}
        </span>

        <span
          aria-hidden
          className="block select-none text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-transparent sm:text-7xl"
          style={{ WebkitTextStroke: '2px var(--color-brand-500)' }}
        >
          {outline}
        </span>

        {solid && (
          <span
            aria-hidden
            className="-mt-1 block text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-brand-600 sm:-mt-2 sm:text-6xl"
          >
            {solid}
          </span>
        )}
      </h2>

      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
