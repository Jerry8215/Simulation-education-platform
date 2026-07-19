import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  clampIndex,
  countdownUrgency,
  formatCountdown,
  navProgress,
  type QuestionState,
} from './exam-ui'

describe('formatCountdown', () => {
  it('muestra mm:ss por debajo de una hora', () => {
    assert.equal(formatCountdown(0), '00:00')
    assert.equal(formatCountdown(9), '00:09')
    assert.equal(formatCountdown(65), '01:05')
    assert.equal(formatCountdown(59 * 60 + 59), '59:59')
  })

  it('muestra h:mm:ss a partir de una hora', () => {
    assert.equal(formatCountdown(3600), '1:00:00')
    assert.equal(formatCountdown(3661), '1:01:01')
  })

  it('un tiempo negativo se muestra como cero, no como texto roto', () => {
    assert.equal(formatCountdown(-5), '00:00')
  })
})

describe('countdownUrgency', () => {
  it('un taller sin cronómetro siempre está en calma', () => {
    assert.equal(countdownUrgency(null), 'calm')
  })

  it('el último minuto es crítico', () => {
    assert.equal(countdownUrgency(60), 'critical')
    assert.equal(countdownUrgency(1), 'critical')
  })

  it('los últimos cinco minutos son advertencia', () => {
    assert.equal(countdownUrgency(5 * 60), 'warning')
    assert.equal(countdownUrgency(61), 'warning')
  })

  it('con tiempo de sobra, en calma', () => {
    assert.equal(countdownUrgency(30 * 60), 'calm')
  })
})

describe('navProgress', () => {
  const q = (order: number, answered: boolean): QuestionState => ({ order, answered })

  it('cuenta respondidas y lista las que faltan', () => {
    const p = navProgress([q(1, true), q(2, false), q(3, true), q(4, false)])
    assert.equal(p.total, 4)
    assert.equal(p.answered, 2)
    assert.deepEqual(p.unanswered, [2, 4])
    assert.equal(p.percent, 50)
  })

  it('un examen sin responder está en 0% sin dividir por cero', () => {
    assert.equal(navProgress([]).percent, 0)
  })

  it('todo respondido es 100%', () => {
    assert.equal(navProgress([q(1, true), q(2, true)]).percent, 100)
  })
})

describe('clampIndex', () => {
  it('no se pasa del final ni del principio', () => {
    assert.equal(clampIndex(-1, 5), 0)
    assert.equal(clampIndex(5, 5), 4)
    assert.equal(clampIndex(2, 5), 2)
  })

  it('un examen vacío se queda en 0', () => {
    assert.equal(clampIndex(3, 0), 0)
  })
})
