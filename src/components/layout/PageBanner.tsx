import Image from 'next/image'

/**
 * La cabecera de una pantalla del estudiante: la ilustración del diseño (el
 * gatito en su escritorio) de fondo, con el título y el subtítulo encima, a la
 * izquierda, sobre un degradado que los mantiene legibles.
 *
 * Todas las pantallas usan el mismo alto y el mismo tratamiento, así que se ven
 * como una familia. El dashboard queda aparte, con su propio diseño.
 */
export function PageBanner({
  image,
  title,
  subtitle,
}: {
  /** La ilustración de fondo. El gato va a la derecha; la izquierda queda libre. */
  image: string
  title: string
  subtitle: string
}) {
  return (
    <section className="relative h-32 overflow-hidden rounded-card shadow-sm sm:h-44">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-right"
        priority
      />

      {/* Degradado a la izquierda para que el título se lea sobre el cielo. */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-100 via-brand-100/85 to-transparent" />

      <div className="absolute inset-y-0 left-0 flex max-w-[62%] flex-col justify-center p-5 sm:p-7">
        <h1 className="text-2xl font-extrabold uppercase leading-tight text-navy-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-navy-800 sm:text-base">{subtitle}</p>
      </div>
    </section>
  )
}
