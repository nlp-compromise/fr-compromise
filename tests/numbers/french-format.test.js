import test from 'tape'
import nlp from '../_lib.js'
let here = '[french-format] '
nlp.verbose(false)

test('decimal comma:', function (t) {
  let arr = [
    ['3,5', 3.5],
    ['10,25', 10.25],
    ['3,14159', 3.14159],
    ['1 234,56', 1234.56],
    // english-style thousands-group is preserved
    ['7,938', 7938],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    t.equal(nlp(str).numbers().get()[0], want, here + str)
  })
  t.end()
})

test('decimal comma in-sentence:', function (t) {
  t.equal(nlp('il mesure 3,5 mètres.').numbers().get()[0], 3.5, here + 'trailing punctuation')
  t.end()
})

test('space thousands-groups:', function (t) {
  let arr = [
    ['2 500', 2500],
    ['1 000 000', 1000000],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    t.equal(nlp(str).numbers().get()[0], want, here + str)
  })
  t.end()
})

test('money:', function (t) {
  t.equal(nlp('50 euros').has('#Money'), true, here + '50 euros')
  t.equal(nlp('50 €').has('#Money'), true, here + '50 €')
  t.equal(nlp('elle gagne 100 euros').numbers().get()[0], 100, here + 'parses amount')
  t.equal(nlp('cinquante personnes').has('#Money'), false, here + 'no false-positive')
  t.end()
})
