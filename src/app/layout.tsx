import type { Metadata } from 'next'
import { Montserrat, Poppins } from 'next/font/google'

// Estilos de KaTeX: las fórmulas matemáticas (`$$...$$`) necesitan su CSS y sus
// fuentes para apilar fracciones, raíces y exponentes correctamente.
import 'katex/dist/katex.min.css'
import './globals.css'

/**
 * El diseño usa Poppins, Montserrat, Glacial Indifference, Intro, Handyman y
 * TT Milks Script. Las tres últimas son comerciales: la licencia de Canva cubre
 * usarlas dentro de Canva, no incrustarlas en un sitio web. En el diseño solo
 * aparecen en el logo y en los banners decorativos, que ya vienen como imagen.
 * El texto vivo de la plataforma es Poppins, que es libre.
 */
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

/**
 * Montserrat es la tipografía de los números en el reporte oficial del ICFES, y
 * la que usa el cliente para los puntajes. Se reserva para las cifras grandes.
 */
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SORA PREICFES',
  description:
    'Prepárate para el examen Saber 11 con simulacros, talleres y estadísticas de tu progreso.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
