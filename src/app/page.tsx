import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LeadForm } from '@/components/landing/LeadForm'
import { Planes } from '@/components/landing/Planes'
import { PublicFooter, PublicHeader } from '@/components/landing/PublicChrome'
import { StackedHeading } from '@/components/landing/StackedHeading'
import { getSession } from '@/lib/auth/session'

export const metadata = {
  title: 'SORA PREICFES — Prepárate para el Saber 11',
  description:
    'Domina la estrategia del ICFES, entiende cómo funciona la prueba y estudia a tu propio ritmo con simulacros y material diseñados para asegurar tu resultado.',
}

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect(session.role === 'ADMIN' ? '/admin' : '/inicio')

  return (
    <div className="bg-canvas">
      <PublicHeader />

      {/* ---------- Portada ---------- */}
      <section id="inicio" className="scroll-mt-20 px-4 py-12 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-base font-bold text-brand-600 shadow-sm sm:text-lg">
              <Image
                src="/assets/home/sparkle-al-lado-de-inscripciones.png"
                alt=""
                width={28}
                height={28}
                className="h-6 w-6"
              />
              Inscripciones abiertas · Mes intensivo
            </p>

            {/* El título con el efecto del diseño: "SORA" hueca y "PRE ICFES" sólida. */}
            <h1 className="relative mt-5">
              <span className="sr-only">SORA PRE ICFES</span>
              <span
                aria-hidden
                className="block select-none text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-transparent sm:text-7xl"
                style={{ WebkitTextStroke: '2px var(--color-brand-500)' }}
              >
                Sora
              </span>
              <span
                aria-hidden
                className="-mt-1 block text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-brand-600 sm:-mt-2 sm:text-6xl"
              >
                Pre Icfes
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg text-navy-800">
              Domina la estrategia del ICFES, entiende cómo funciona la prueba y estudia a tu propio
              ritmo con simulacros y material diseñados para asegurar tu resultado.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#contactanos"
                className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-500"
              >
                Prueba un Simulacro
              </a>
              <a
                href="#planes"
                className="rounded-xl border-2 border-navy-900 px-6 py-3 font-semibold text-navy-900 transition hover:bg-white"
              >
                ¿Qué incluye?
              </a>
            </div>

            <p className="mt-5 text-sm text-muted-600">
              ¿Ya tienes tu código de acceso?{' '}
              <Link href="/registro" className="font-semibold text-brand-600 hover:underline">
                Crea tu cuenta
              </Link>
            </p>
          </div>

          {/* Los dos gatos de la página van al mismo tamaño (grande), para que
              se vean bien y consistentes. */}
          <Image
            src="/assets/home/gatto-con-nube.png"
            alt="El gatito de SORA"
            width={560}
            height={560}
            className="mx-auto w-80 sm:w-[28rem]"
            priority
          />
        </div>
      </section>

      {/* ---------- Sobre SORA ---------- */}
      <section id="sobre-sora" className="scroll-mt-20 bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <Image
              src="/assets/sobre-soraa/gato-con-corona.png"
              alt=""
              width={460}
              height={460}
              className="mx-auto w-80 sm:w-[28rem]"
            />

            <div>
              <StackedHeading eyebrow="sobre" outline="Sora" solid="" className="mb-1">
                <p className="text-xl font-bold italic text-brand-600 sm:text-2xl">
                  Mucho más que preparación, acompañamos tus sueños
                </p>
              </StackedHeading>

              <p className="mt-5 text-navy-800">
                En SORA buscamos que cada estudiante viva su preparación para el ICFES con mayor
                confianza, tranquilidad y motivación. Creemos en un aprendizaje cercano y humano,
                donde el bienestar, la constancia y el acompañamiento son tan importantes como los
                resultados.
              </p>
              <p className="mt-3 text-navy-800">
                Nuestro propósito es ayudar a que cada estudiante descubra su potencial y construya
                el camino hacia las oportunidades que sueña alcanzar.
              </p>
            </div>
          </div>

          {/* Método SORA */}
          <h3 className="mt-14 text-center text-xl font-extrabold uppercase text-navy-900 sm:text-2xl">
            Método <span className="text-brand-600">SORA</span>
          </h3>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <Pillar
              title="Acompañamiento Especializado"
              detail="No estás solx en esto. Analizamos tus errores para ayudarte a organizar tu tiempo y priorizar los temas que más te cuestan."
            />
            <Pillar
              title="Simulacros y Material"
              detail="Pruebas tipo ICFES con cronómetro y calificación real, más el material de estudio para reforzar cada área."
            />
            <Pillar
              title="Clases en Vivo y Plataforma Interactiva"
              detail="Sesiones enfocadas en la organización del tiempo, el manejo del estrés y la orientación vocacional."
            />
          </div>
        </div>
      </section>

      {/* ---------- Planes ---------- */}
      <section id="planes" className="scroll-mt-20 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <StackedHeading align="center" eyebrow="nuestros" outline="Planes" className="mb-8">
            <p className="text-navy-800">Esto es lo que incluye tu preparación con SORA.</p>
          </StackedHeading>

          <Planes />
        </div>
      </section>

      {/* ---------- Contáctanos ---------- */}
      <section id="contactanos" className="scroll-mt-20 bg-white px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <StackedHeading outline="¿Qué esperas" solid="para iniciar?">
              <p className="text-navy-800">
                Deja tus datos y nuestro equipo te enviará toda la información. Al inscribirte
                recibirás tu <strong>código de acceso</strong> para entrar a la plataforma.
              </p>
            </StackedHeading>

            <dl className="mt-8 flex flex-col gap-5">
              <Contact
                icon="/assets/contactanos/whatsapp-icon.png"
                label="WhatsApp"
                items={[
                  { text: '324 4162444', href: 'https://wa.me/573244162444' },
                  { text: '305 2940334', href: 'https://wa.me/573052940334' },
                ]}
              />
              <Contact
                icon="/assets/contactanos/gmail-icon.png"
                label="Email"
                items={[
                  { text: 'sorapreicfes@gmail.com', href: 'mailto:sorapreicfes@gmail.com' },
                ]}
              />
              <Contact
                icon="/assets/contactanos/ig-icon.png"
                label="Instagram"
                items={[{ text: '@soraicfes', href: 'https://instagram.com/soraicfes' }]}
              />
              <Contact
                icon="/assets/contactanos/tik-tok-icon.png"
                label="TikTok"
                items={[{ text: '@soraicfes', href: 'https://tiktok.com/@soraicfes' }]}
              />
            </dl>
          </div>

          <div className="rounded-card bg-canvas p-6 shadow-sm">
            <h3 className="mb-1 text-xl font-bold text-navy-900">¡Te Contactamos!</h3>
            <p className="mb-5 text-sm text-muted-600">
              Deja tus datos y nuestro equipo te enviará toda la información.
            </p>
            <LeadForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

function Pillar({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-card bg-canvas p-5 shadow-sm">
      <h4 className="font-bold text-brand-600">{title}</h4>
      <p className="mt-2 text-sm text-navy-800">{detail}</p>
    </article>
  )
}

function Contact({
  icon,
  label,
  items,
}: {
  icon: string
  label: string
  items: Array<{ text: string; href: string }>
}) {
  return (
    <div className="flex items-start gap-3">
      <Image src={icon} alt="" width={40} height={40} className="h-9 w-9 shrink-0" />
      <div>
        <dt className="font-semibold text-brand-600">{label}</dt>
        <dd className="text-navy-900">
          {items.map((item, i) => (
            <span key={item.href}>
              {i > 0 && ' · '}
              <a href={item.href} className="hover:underline">
                {item.text}
              </a>
            </span>
          ))}
        </dd>
      </div>
    </div>
  )
}
