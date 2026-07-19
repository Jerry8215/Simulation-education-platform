import type { StatsPoint } from '@/lib/stats'

/**
 * La gráfica de "Evolución del Puntaje" del diseño (página 12).
 *
 * SVG puro, sin librerías: son cinco puntos y una línea. Traer una librería de
 * gráficas para esto costaría más de lo que resuelve.
 */
export function EvolutionChart({
  points,
  max,
}: {
  points: StatsPoint[]
  /** El techo de la escala: 500 si es puntaje global, 100 si es porcentaje. */
  max: number
}) {
  if (points.length === 0) return null

  const W = 520
  const H = 200
  const PAD = { top: 16, right: 16, bottom: 34, left: 40 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const values = points.map((p) => p.value)
  // La escala se ajusta a los datos para que la línea no quede aplastada abajo,
  // pero siempre con un poco de aire arriba y abajo.
  const lo = Math.max(0, Math.min(...values) - Math.round(max * 0.08))
  const hi = Math.min(max, Math.max(...values) + Math.round(max * 0.08))
  const span = hi - lo || 1

  const x = (i: number) =>
    PAD.left + (points.length === 1 ? plotW / 2 : (i * plotW) / (points.length - 1))
  const y = (v: number) => PAD.top + plotH - ((v - lo) / span) * plotH

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  const area = `${line} L ${x(points.length - 1)} ${PAD.top + plotH} L ${x(0)} ${PAD.top + plotH} Z`

  // Cuatro marcas en el eje vertical.
  const ticks = Array.from({ length: 4 }, (_, i) => Math.round(lo + (span * i) / 3))

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Evolución del puntaje: ${points.map((p) => `${p.label}, ${p.value}`).join('; ')}`}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke="currentColor"
            className="text-brand-200"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={y(t) + 4}
            textAnchor="end"
            className="fill-muted-600 text-[10px]"
          >
            {t}
          </text>
        </g>
      ))}

      <path d={area} className="fill-brand-100" opacity={0.7} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        className="text-brand-600"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={p.label + i}>
          <circle cx={x(i)} cy={y(p.value)} r={4.5} className="fill-brand-600" />
          <text
            x={x(i)}
            y={y(p.value) - 10}
            textAnchor="middle"
            className="fill-navy-900 text-[11px] font-bold"
          >
            {p.value}
          </text>
          <text
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            className="fill-muted-600 text-[9px]"
          >
            {p.label.length > 14 ? `${p.label.slice(0, 13)}…` : p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
