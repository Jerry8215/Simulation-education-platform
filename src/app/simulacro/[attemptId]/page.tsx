import { redirect } from 'next/navigation'

import { ExamRunner } from '@/components/exam/ExamRunner'
import { requireUser } from '@/lib/auth/require'
import { AttemptError, getExamView } from '@/lib/attempts'

// En Next 16 params es una promesa.
export default async function SimulacroPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const { userId } = await requireUser()

  try {
    const view = await getExamView(userId, attemptId)
    // `key` por parte: al pasar de la parte 1 a la 2, el componente se vuelve a
    // montar desde cero (respuestas, cronómetro y navegador de la nueva parte)
    // en vez de reusar el estado de la parte anterior.
    return <ExamRunner key={view.currentPart} view={view} />
  } catch (error) {
    if (error instanceof AttemptError) {
      // Tiempo agotado, intento ya enviado o no encontrado: al resultado o al listado.
      redirect('/simulacros')
    }
    throw error
  }
}
