import test from 'tape'
import nlp from '../_lib.js'
const here = '[numbers-hmm] '

// belgian + swiss number-words are not supported - 'nonante-neuf' parses as 9
test('regional numbers:', function (t) {
  const arr = [
    ['septante', 70],
    ['huitante', 80],
    ['octante', 80],
    ['nonante', 90],
    ['nonante-neuf', 99],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    t.deepEqual(nlp(str).numbers().get(), [want], here + str)
  })
  t.end()
})

// 'premier' is not found as a number, and 1 becomes 'unième'
test('premier:', function (t) {
  t.deepEqual(nlp('le premier jour').numbers().get(), [1], here + 'premier')
  t.deepEqual(nlp('la première fois').numbers().get(), [1], here + 'première')
  let doc = nlp('1er')
  doc.numbers().toText()
  t.equal(doc.text(), 'premier', here + '1er toText')
  doc = nlp('un chat')
  doc.numbers().toOrdinal()
  t.equal(doc.text(), 'premier chat', here + 'un toOrdinal')
  t.end()
})

test('numeric ordinal suffixes:', function (t) {
  t.deepEqual(nlp('2ème').numbers().get(), [2], here + '2ème')
  t.end()
})

// 'cinquante pour cent' is two numbers - 50 and 100
test('pour cent:', function (t) {
  const m = nlp('cinquante pour cent').numbers()
  t.equal(m.length, 1, here + 'one number')
  t.equal(m.get()[0], 50, here + 'value')
  t.end()
})

// fractions come back as their numerator
test('fractions:', function (t) {
  t.deepEqual(nlp('1/2').numbers().get(), [0.5], here + '1/2')
  t.deepEqual(nlp('trois quarts').numbers().get(), [0.75], here + 'trois quarts')
  t.end()
})

// math on a decimal-comma number writes it back with a decimal-point
test('decimal-comma is kept:', function (t) {
  const doc = nlp('1,5 litre')
  doc.numbers().add(1)
  t.equal(doc.text(), '2,5 litre', here + 'add')
  t.end()
})

// the view returned by .add() has lost its number - .get() gives ['']
test('get after add:', function (t) {
  t.deepEqual(nlp('cinq').numbers().add(2).get(), [7], here + 'text')
  t.deepEqual(nlp('5').numbers().add(2).get(), [7], here + 'digits')
  t.deepEqual(nlp('cinq').numbers().set(7).get(), [7], here + 'set')
  t.end()
})
