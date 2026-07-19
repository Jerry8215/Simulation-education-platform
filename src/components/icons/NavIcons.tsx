/**
 * Los iconos de la barra lateral, dibujados en SVG.
 *
 * Los del diseño eran PNG de 25×25 px: en una pantalla moderna se veían
 * borrosos. En SVG son nítidos a cualquier tamaño y en cualquier pantalla, y
 * heredan el color del texto, así que se iluminan igual que la etiqueta cuando
 * la sección está activa.
 */

type Props = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function HomeIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  )
}

export function SimulacroIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TallerIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 3.5h9a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8 8h6M8 12h6M8 16h4" />
      <path d="M18 7l2.5 2.5-5 5-2.5.5.5-2.5 5-5Z" />
    </svg>
  )
}

export function ResultadosIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}

export function EstadisticasIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 20v-6M12 20v-9M16 20v-4" />
    </svg>
  )
}

export function PerfilIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}

export function ContactoIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 3V6a1 1 0 0 1 1-1Z" />
      <path d="M9 9h6M9 12.5h4" />
    </svg>
  )
}
