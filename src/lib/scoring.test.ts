import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  areaScore,
  gradeAttempt,
  globalScore,
  goalProgress,
  qualitativeLabel,
  strengthsAndWeaknesses,
  type Area,
  type GradableAnswer,
} from './scoring'

const ALL = (v: number): Record<Area, number> => ({
  LECTURA_CRITICA: v,
  MATEMATICAS: v,
  SOCIALES_CIUDADANAS: v,
  CIENCIAS_NATURALES: v,
  INGLES: v,
})

describe('§2 puntaje global — fórmula oficial ICFES', () => {
  it('puntaje perfecto en las cinco áreas da exactamente 500', () => {
    assert.equal(globalScore(ALL(100)), 500)
  })

  it('cero en todo da 0', () => {
    assert.equal(globalScore(ALL(0)), 0)
  })

  it('50 en todo da 250', () => {
    assert.equal(globalScore(ALL(50)), 250)
  })

  it('Inglés pesa un tercio de las demás áreas', () => {
    // Subir Inglés 13 puntos debe mover el global lo mismo que subir
    // Matemáticas 13/3 puntos. Comprobamos con el caso limpio: 100 en Inglés
    // y 0 en el resto -> (0*3*4 + 100*1) / 13 * 5 = 38.46 -> 38
    assert.equal(globalScore({ ...ALL(0), INGLES: 100 }), 38)
    // 100 en Matemáticas y 0 en el resto -> (100*3) / 13 * 5 = 115.38 -> 115
    assert.equal(globalScore({ ...ALL(0), MATEMATICAS: 100 }), 115)
  })

  it('devuelve null si falta un área — un global parcial no es comparable con el ICFES', () => {
    const parcial = { LECTURA_CRITICA: 80, MATEMATICAS: 70 }
    assert.equal(globalScore(parcial), null)
  })
})

describe('§1 puntaje por área', () => {
  it('es el porcentaje de puntos obtenidos sobre posibles', () => {
    assert.equal(areaScore({ obtained: 7, possible: 10 }), 70)
  })

  it('un área sin preguntas no revienta ni divide por cero', () => {
    assert.equal(areaScore({ obtained: 0, possible: 0 }), 0)
  })

  it('redondea al entero más cercano', () => {
    assert.equal(areaScore({ obtained: 2, possible: 3 }), 67)
  })
})

describe('§3 nota cualitativa — los ejemplos del diseño del cliente', () => {
  it('72 es "Bueno", como aparece en la pantalla de Resultados', () => {
    assert.equal(qualitativeLabel(72), 'Bueno')
  })

  it('82 es "Excelente", como aparece en la pantalla de Resultados', () => {
    assert.equal(qualitativeLabel(82), 'Excelente')
  })

  it('respeta los límites de cada rango', () => {
    assert.equal(qualitativeLabel(90), 'Sobresaliente')
    assert.equal(qualitativeLabel(89), 'Excelente')
    assert.equal(qualitativeLabel(75), 'Excelente')
    assert.equal(qualitativeLabel(74), 'Bueno')
    assert.equal(qualitativeLabel(60), 'Bueno')
    assert.equal(qualitativeLabel(59), 'Básico')
    assert.equal(qualitativeLabel(40), 'Básico')
    assert.equal(qualitativeLabel(39), 'Necesita refuerzo')
    assert.equal(qualitativeLabel(0), 'Necesita refuerzo')
  })
})

describe('§4 fortalezas y debilidades — es un ranking, no un umbral', () => {
  it('reproduce la pantalla de Estadísticas del diseño', () => {
    // En el diseño: Sociales 87, Inglés 83, Lectura Crítica 74 son fortalezas;
    // Matemáticas 67 y Ciencias Naturales 13 necesitan refuerzo.
    // Un umbral fijo no explicaría que 74 sea fortaleza y 67 debilidad.
    const { strengths, toReinforce } = strengthsAndWeaknesses({
      SOCIALES_CIUDADANAS: 87,
      INGLES: 83,
      LECTURA_CRITICA: 74,
      MATEMATICAS: 67,
      CIENCIAS_NATURALES: 13,
    })

    assert.deepEqual(
      strengths.map((s) => s.area),
      ['SOCIALES_CIUDADANAS', 'INGLES', 'LECTURA_CRITICA'],
    )
    assert.deepEqual(
      toReinforce.map((s) => s.area),
      ['MATEMATICAS', 'CIENCIAS_NATURALES'],
    )
  })

  it('un estudiante que va bajo en todo igual ve tres fortalezas', () => {
    const { strengths, toReinforce } = strengthsAndWeaknesses(ALL(30))
    assert.equal(strengths.length, 3)
    assert.equal(toReinforce.length, 2)
  })

  it('los empates se rompen de forma estable', () => {
    const a = strengthsAndWeaknesses(ALL(50))
    const b = strengthsAndWeaknesses(ALL(50))
    assert.deepEqual(a, b)
  })
})

describe('gradeAttempt', () => {
  const q = (
    area: Area,
    correctOption: 'A' | 'B' | 'C' | 'D',
    selected: 'A' | 'B' | 'C' | 'D' | null,
    weight = 1,
  ): GradableAnswer => ({ area, correctOption, selected, weight })

  it('una respuesta en blanco cuenta como incorrecta y no resta', () => {
    const graded = gradeAttempt([
      q('MATEMATICAS', 'A', 'A'),
      q('MATEMATICAS', 'B', null),
    ])
    assert.equal(graded.correctCount, 1)
    assert.equal(graded.percent, 50)
    assert.deepEqual(graded.results, [true, false])
  })

  it('el peso de una pregunta multiplica su valor', () => {
    // Acierta la de peso 3, falla la de peso 1 -> 3 de 4 puntos posibles = 75%
    const graded = gradeAttempt([
      q('MATEMATICAS', 'A', 'A', 3),
      q('MATEMATICAS', 'B', 'C', 1),
    ])
    assert.equal(graded.percent, 75)
    assert.equal(graded.obtainedWeight, 3)
    assert.equal(graded.totalWeight, 4)
    // Pero solo una pregunta acertada de dos.
    assert.equal(graded.correctCount, 1)
  })

  it('un peso inválido (0 o negativo) se trata como 1 en vez de romper el puntaje', () => {
    const graded = gradeAttempt([q('INGLES', 'A', 'A', 0)])
    assert.equal(graded.totalWeight, 1)
    assert.equal(graded.percent, 100)
  })

  it('un simulacro completo perfecto da global 500', () => {
    const answers = (['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES_CIUDADANAS', 'CIENCIAS_NATURALES', 'INGLES'] as Area[]).map(
      (area) => q(area, 'A', 'A'),
    )
    const graded = gradeAttempt(answers)
    assert.equal(graded.globalScore, 500)
    assert.equal(graded.percent, 100)
    assert.equal(graded.label, 'Sobresaliente')
  })

  it('un taller de una sola área no produce puntaje global', () => {
    const graded = gradeAttempt([q('CIENCIAS_NATURALES', 'C', 'C'), q('CIENCIAS_NATURALES', 'A', 'B')])
    assert.equal(graded.globalScore, null)
    assert.equal(graded.percent, 50)
    assert.equal(graded.areaScores.length, 1)
    assert.equal(graded.areaScores[0]!.score, 50)
  })

  it('un intento vacío no divide por cero', () => {
    const graded = gradeAttempt([])
    assert.equal(graded.percent, 0)
    assert.equal(graded.globalScore, null)
    assert.equal(graded.correctCount, 0)
  })

  it('el puntaje por área usa los pesos de esa área, no los del intento completo', () => {
    const graded = gradeAttempt([
      q('MATEMATICAS', 'A', 'A', 1), // acierta 1 de 1
      q('INGLES', 'A', 'B', 9), // falla 0 de 9
    ])
    const mat = graded.areaScores.find((a) => a.area === 'MATEMATICAS')!
    const ing = graded.areaScores.find((a) => a.area === 'INGLES')!
    assert.equal(mat.score, 100)
    assert.equal(ing.score, 0)
    // Y el porcentaje global del intento sí mezcla los pesos: 1 de 10.
    assert.equal(graded.percent, 10)
  })
})

describe('§6 avance hacia la meta', () => {
  it('280 sobre una meta de 476 es 59%', () => {
    assert.equal(goalProgress(280, 476), 59)
  })

  it('nunca pasa de 100 aunque supere la meta', () => {
    assert.equal(goalProgress(500, 400), 100)
  })

  it('una meta de 0 no divide por cero', () => {
    assert.equal(goalProgress(280, 0), 0)
  })
})
