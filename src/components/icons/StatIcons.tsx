/**
 * Los iconos de las tarjetas del panel, dibujados en SVG.
 *
 * Antes eran imágenes PNG del diseño, usadas como fondo de la tarjeta: al
 * estirarlas se veían pixeladas y el icono salía enorme junto a un texto
 * pequeño. En SVG son nítidos a cualquier tamaño y el tamaño se controla desde
 * el código.
 *
 * Siguen la línea del diseño: trazo azul sobre un círculo azul claro.
 */

type Props = { className?: string }

function Circle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-100 ${className}`}
    >
      {children}
    </span>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** Diana: los simulacros. */
export function TargetIcon({ className = 'h-14 w-14' }: Props) {
  return (
    <Circle className={className}>
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-brand-600" aria-hidden>
        <circle cx="11" cy="13" r="8" {...stroke} />
        <circle cx="11" cy="13" r="4.5" {...stroke} />
        <circle cx="11" cy="13" r="1.4" fill="currentColor" stroke="none" />
        <path d="M11 13 20.5 3.5" {...stroke} />
        <path d="M16.5 3.5h4v4" {...stroke} />
      </svg>
    </Circle>
  )
}

/** Portapapeles: los talleres. Simétrico y centrado en el lienzo. */
export function WorkshopIcon({ className = 'h-14 w-14' }: Props) {
  return (
    <Circle className={className}>
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-brand-600" aria-hidden>
        <path d="M6 5.5h12a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" {...stroke} />
        <path d="M9 5.5a3 3 0 0 1 6 0" {...stroke} />
        <path d="M8.5 11h7M8.5 14h7M8.5 17h4" {...stroke} />
      </svg>
    </Circle>
  )
}

/** Trofeo con estrella: el mejor puntaje. */
export function TrophyIcon({ className = 'h-14 w-14' }: Props) {
  return (
    <Circle className={className}>
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-brand-600" aria-hidden>
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" {...stroke} />
        <path d="M7 5.5H4.5v1.5a3 3 0 0 0 3 3" {...stroke} />
        <path d="M17 5.5h2.5v1.5a3 3 0 0 1-3 3" {...stroke} />
        <path d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5Z" {...stroke} />
        <path
          d="m12 5.6.85 1.72 1.9.28-1.38 1.34.33 1.9L12 9.94l-1.7.9.33-1.9-1.38-1.34 1.9-.28L12 5.6Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </Circle>
  )
}
