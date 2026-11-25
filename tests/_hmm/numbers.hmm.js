import test from 'tape'
import nlp from '../_lib.js'
const here = '[numbers-hmm] '

// (the regional, premier, ordinal-suffix, pour-cent, fraction and decimal-comma tests
// now pass, and live in tests/unit/numbers/number-forms.test.js)
// (the '50%' toText test now passes, and lives in tests/unit/numbers/number-symbols.test.js)

// a lone 'premier' is an Adjective, so that .adjectives().conjugate() works - it is only a number beside a noun or determiner
test('lone premier:', function (t) {
  t.deepEqual(nlp('premier').numbers().get(), [1], here + 'premier')
  t.deepEqual(nlp('il est premier').numbers().get(), [1], here + 'est premier')
  t.end()
})

// only demi, tiers and quart are known as the bottom of a fraction - an ordinal is not
test('ordinal fractions:', function (t) {
  t.deepEqual(nlp('deux cinquièmes').numbers().get(), [0.4], here + 'deux cinquièmes')
  t.end()
})

// two numerals beside an 'et' are joined into one number, like 'vingt et un' is
test('numerals around et:', function (t) {
  t.deepEqual(nlp('5 et 10').numbers().get(), [5, 10], here + '5 et 10')
  t.deepEqual(nlp('il a 5€ et 50%').numbers().get(), [5, 50], here + '5€ et 50%')
  t.end()
})

// 'million' and 'milliard' are nouns, and need a 'de' before their unit
test('million de:', function (t) {
  const doc = nlp('1000000€')
  doc.numbers().toText()
  t.equal(doc.text(), "un million d'euros", here + '1000000€ toText')
  t.end()
})
