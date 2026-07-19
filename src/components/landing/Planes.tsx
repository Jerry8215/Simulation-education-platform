import Image from 'next/image'

/**
 * La tabla de planes. Antes era una imagen del diseño; ahora es HTML real, así
 * que se lee bien en el celular, la encuentra Google, y los precios se cambian
 * editando una línea en vez de rehacer la imagen en Canva.
 *
 * Los datos son los del diseño del cliente.
 */

type Cell = boolean | string

const PLANS = [
  {
    key: 'intensivo',
    name: 'Mes Intensivo',
    tagline: 'Acompañamiento completo',
    duration: '1 mes',
    price: '$80.000',
    featured: true,
  },
  {
    key: 'asesoria',
    name: 'Simulacro + Asesoría',
    tagline: 'Diagnóstico personalizado',
    duration: '1 sesión',
    price: '$20.000',
    featured: false,
  },
] as const

const FEATURES: Array<{ label: string; intensivo: Cell; asesoria: Cell }> = [
  {
    label: 'Simulacros tipo ICFES',
    intensivo: '2 simulacros (+280 preguntas c/u)',
    asesoria: '1 simulacro (+280 preguntas)',
  },
  { label: 'Análisis de resultados', intensivo: true, asesoria: true },
  { label: 'Recomendaciones personalizadas', intensivo: true, asesoria: true },
  { label: 'Asesoría individual', intensivo: false, asesoria: true },
  { label: 'Plan de mejora', intensivo: true, asesoria: true },
  { label: 'Acceso a plataforma', intensivo: true, asesoria: true },
  { label: 'Material exclusivo', intensivo: true, asesoria: true },
  { label: 'Clases en vivo', intensivo: true, asesoria: false },
  { label: 'Talleres prácticos', intensivo: true, asesoria: false },
  { label: 'Sesiones de orientación', intensivo: true, asesoria: false },
]

function Mark({ value }: { value: Cell }) {
  if (typeof value === 'string') {
    return <span className="text-sm text-navy-900">{value}</span>
  }
  return value ? (
    <span className="text-xl font-bold text-brand-600" aria-label="Incluido">
      ✔
    </span>
  ) : (
    <span className="text-xl text-muted-600/50" aria-label="No incluido">
      ✕
    </span>
  )
}

export function Planes() {
  return (
    <>
      {/* Tarjetas — en móvil */}
      <div className="grid gap-5 md:hidden">
        {PLANS.map((plan) => (
          <article
            key={plan.key}
            className={`rounded-card p-5 shadow-sm ${
              plan.featured ? 'bg-brand-600 text-white' : 'bg-white'
            }`}
          >
            <h3 className={`text-xl font-extrabold ${plan.featured ? 'text-white' : 'text-navy-900'}`}>
              {plan.name} {plan.featured && '⭐'}
            </h3>
            <p className={`text-sm ${plan.featured ? 'text-white/85' : 'text-muted-600'}`}>
              {plan.tagline}
            </p>

            <p className={`mt-4 text-3xl font-extrabold ${plan.featured ? 'text-white' : 'text-brand-600'}`}>
              {plan.price}
            </p>
            <p className={`text-sm ${plan.featured ? 'text-white/85' : 'text-muted-600'}`}>
              {plan.duration}
            </p>

            <ul className="mt-4 flex flex-col gap-2 text-left">
              {FEATURES.map((f) => {
                const value = plan.key === 'intensivo' ? f.intensivo : f.asesoria
                if (value === false) return null
                return (
                  <li
                    key={f.label}
                    className={`flex gap-2 text-sm ${plan.featured ? 'text-white' : 'text-navy-900'}`}
                  >
                    <span aria-hidden>✔</span>
                    <span>
                      {f.label}
                      {typeof value === 'string' && (
                        <span className={plan.featured ? 'text-white/80' : 'text-muted-600'}>
                          {' '}
                          — {value}
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>

            <a
              href="#contactanos"
              className={`mt-5 block rounded-xl px-6 py-3 text-center font-semibold transition ${
                plan.featured
                  ? 'bg-white text-brand-600 hover:bg-brand-100'
                  : 'bg-brand-600 text-white hover:bg-brand-500'
              }`}
            >
              Quiero este plan
            </a>
          </article>
        ))}
      </div>

      {/* Tabla comparativa — desde tablet */}
      <div className="hidden overflow-hidden rounded-card bg-white shadow-sm md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="w-1/3 p-5 align-bottom text-lg font-bold text-navy-900">
                ¿Qué incluye?
              </th>
              {PLANS.map((plan) => (
                <th
                  key={plan.key}
                  className={`p-5 text-center align-bottom ${
                    plan.featured ? 'bg-brand-600 text-white' : 'bg-brand-100/60'
                  }`}
                >
                  <span
                    className={`block text-xl font-extrabold ${
                      plan.featured ? 'text-white' : 'text-navy-900'
                    }`}
                  >
                    {plan.name} {plan.featured && '⭐'}
                  </span>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                      plan.featured ? 'bg-white/20 text-white' : 'bg-white text-brand-600'
                    }`}
                  >
                    {plan.tagline}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {FEATURES.map((f, i) => (
              <tr key={f.label} className={i % 2 ? 'bg-canvas/50' : ''}>
                <td className="p-4 font-medium text-navy-900">{f.label}</td>
                <td className="p-4 text-center">
                  <Mark value={f.intensivo} />
                </td>
                <td className="p-4 text-center">
                  <Mark value={f.asesoria} />
                </td>
              </tr>
            ))}

            <tr className="border-t-2 border-brand-200">
              <td className="p-4 font-bold text-navy-900">Duración</td>
              {PLANS.map((p) => (
                <td key={p.key} className="p-4 text-center font-semibold text-brand-600">
                  {p.duration}
                </td>
              ))}
            </tr>

            <tr className="bg-brand-100/40">
              <td className="p-4 font-bold text-navy-900">Inversión</td>
              {PLANS.map((p) => (
                <td key={p.key} className="p-4 text-center">
                  <span className="text-2xl font-extrabold text-navy-900">{p.price}</span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4" />
              {PLANS.map((p) => (
                <td key={p.key} className="p-4 text-center">
                  <a
                    href="#contactanos"
                    className={`inline-block rounded-xl px-6 py-2.5 font-semibold transition ${
                      p.featured
                        ? 'bg-brand-600 text-white hover:bg-brand-500'
                        : 'border-2 border-brand-600 text-brand-600 hover:bg-brand-100'
                    }`}
                  >
                    Quiero este plan
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Descarga del PDF con toda la información */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Image
          src="/assets/planes/quieres-ver-mas-gatito.png"
          alt=""
          width={260}
          height={260}
          className="w-40 sm:w-48"
        />
        <a
          href="/info-sora.pdf"
          download
          className="rounded-xl bg-navy-900 px-8 py-4 text-lg font-semibold text-white transition hover:bg-brand-600"
        >
          📄 Descarga toda la información en PDF
        </a>
      </div>
    </>
  )
}
