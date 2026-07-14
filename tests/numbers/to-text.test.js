import test from 'tape'
import nlp from '../_lib.js'
let here = '[number to-text] '
nlp.verbose(false)

test('number toText:', function (t) {
  let arr = [
    [7, 'sept'],
    [21, 'vingt et un'],
    [42, 'quarante-deux'],
    [71, 'soixante et onze'],
    [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'],
    [91, 'quatre-vingt-onze'],
    [100, 'cent'],
    [200, 'deux cents'],
    [1000, 'mille'],
    [2001, 'deux mille un'],
  ]
  arr.forEach(function (a) {
    let [n, want] = a
    let doc = nlp(String(n))
    doc.numbers().toText()
    t.equal(doc.text(), want, here + n)
  })
  t.end()
})

test('number toText in-sentence:', function (t) {
  let doc = nlp('il a 100 ans')
  doc.numbers().toText()
  t.equal(doc.text(), 'il a cent ans', here + 'in-sentence')
  t.end()
})

test('number toNumber:', function (t) {
  let doc = nlp('soixante-quinze pommes')
  doc.numbers().toNumber()
  t.equal(doc.text(), '75 pommes', here + 'toNumber w/ unit')
  t.end()
})

test('number word toOrdinal:', function (t) {
  let doc = nlp('vingt et un')
  doc.numbers().toOrdinal()
  t.equal(doc.text(), 'vingt et unième', here + 'word ordinal')
  t.end()
})

test('number isOrdinal isCardinal:', function (t) {
  t.equal(nlp('la troisième fois').numbers().isOrdinal().found, true, here + 'troisième is ordinal')
  t.equal(nlp('la troisième fois').numbers().isCardinal().found, false, here + 'troisième not cardinal')
  t.equal(nlp('trois pommes').numbers().isCardinal().found, true, here + 'trois is cardinal')
  t.equal(nlp('3e').numbers().isOrdinal().found, true, here + '3e is ordinal')
  t.end()
})

test('number percent:', function (t) {
  t.equal(nlp('42%').has('#Percent'), true, here + '42% is percent')
  t.equal(nlp('42%').numbers().get()[0], 42, here + '42% parses')
  t.end()
})
