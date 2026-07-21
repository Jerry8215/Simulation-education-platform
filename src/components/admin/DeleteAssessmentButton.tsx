'use client'

import { deleteAssessmentAction } from '@/app/admin/simulacros/actions'

/**
 * Botón de eliminar un simulacro/taller, con confirmación en el navegador que
 * avisa cuántas presentaciones de estudiantes se perderán. El borrado real lo
 * hace `deleteAssessmentAction` en el servidor.
 */
export function DeleteAssessmentButton({
  title,
  assessmentId,
  attempts,
}: {
  title: string
  assessmentId: string
  attempts: number
}) {
  return (
    <form
      action={deleteAssessmentAction}
      onSubmit={(e) => {
        const aviso =
          attempts > 0
            ? `¿Eliminar «${title}»?\n\nSe borrarán también ${attempts} presentación(es) de estudiantes ` +
              `(sus respuestas y puntajes de ESTE simulacro). Las preguntas quedan en el banco.\n\n` +
              `Esta acción NO se puede deshacer.`
            : `¿Eliminar «${title}»?\n\nLas preguntas quedan en el banco. Esta acción NO se puede deshacer.`
        if (!window.confirm(aviso)) e.preventDefault()
      }}
    >
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10"
      >
        Eliminar
      </button>
    </form>
  )
}
