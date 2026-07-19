import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { hasMath, splitMath } from './math-text'

const mathValues = (s: string) =>
  splitMath(s)
    .filter((t) => t.type === 'math')
    .map((t) => (t as { value: string }).value)

describe('splitMath: separa texto de fórmulas', () => {
  it('un texto sin fórmulas es un solo trozo de texto', () => {
    assert.deepEqual(splitMath('¿Cuál es el valor de x?'), [
      { type: 'text', value: '¿Cuál es el valor de x?' },
    ])
  })

  it('una cadena vacía no produce trozos', () => {
    assert.deepEqual(splitMath(''), [])
  })

  it('una fórmula incrustada en una frase va en línea', () => {
    assert.deepEqual(splitMath('Simplifica $$\\frac{1}{13}$$ ahora'), [
      { type: 'text', value: 'Simplifica ' },
      { type: 'math', value: '\\frac{1}{13}', display: false },
      { type: 'text', value: ' ahora' },
    ])
  })

  it('un enunciado que es SOLO una fórmula va en grande (display)', () => {
    const tokens = splitMath('$$x^2 + 1 = 0$$')
    assert.equal(tokens.length, 1)
    assert.equal(tokens[0]!.type, 'math')
    assert.equal((tokens[0] as { display: boolean }).display, true)
    assert.equal((tokens[0] as { value: string }).value, 'x^2 + 1 = 0')
  })

  it('dos fórmulas en la misma frase', () => {
    assert.deepEqual(mathValues('De $$a$$ a $$b$$'), ['a', 'b'])
  })

  it('los pesos colombianos NO son fórmula: un solo $ es plata', () => {
    // El caso que rompía todo: dos precios en una frase no se comen el texto.
    const input = 'El libro cuesta $5.000 y el cuaderno $3.500 en total'
    assert.deepEqual(splitMath(input), [{ type: 'text', value: input }])
    assert.equal(hasMath('cuesta $5.000'), false)
  })

  it('el ejemplo del cliente: fracción continua anidada', () => {
    const input = 'Ordena $$1 + \\cfrac{1}{1 + \\cfrac{1}{13}}$$ de menor a mayor'
    assert.deepEqual(mathValues(input), ['1 + \\cfrac{1}{1 + \\cfrac{1}{13}}'])
  })

  it('hasMath no lleva estado entre llamadas', () => {
    // Con una regex global y `.test()`, la segunda llamada daría false.
    assert.equal(hasMath('vale $$x$$'), true)
    assert.equal(hasMath('vale $$x$$'), true)
    assert.equal(hasMath('sin formula'), false)
  })
})
