import test from 'tape'
import nlp from '../_lib.js'
const here = '[nouns-hmm] '

test('plural exceptions:', function (t) {
  const arr = [
    ['vitrail', 'vitraux'],
    ['landau', 'landaus'],
  ]
  arr.forEach(function (a) {
    const [singular, plural] = a
    const o = nlp('un ' + singular).nouns().conjugate()[0] || {}
    t.equal(o.plural, plural, here + singular)
  })
  t.end()
})

// conjugate() knows 'jeu' -> 'jeux', but toPlural() leaves it alone
test('toPlural agrees with conjugate:', function (t) {
  const doc = nlp('un jeu')
  t.equal(doc.nouns().conjugate()[0].plural, 'jeux', here + 'conjugate')
  doc.nouns().toPlural()
  t.equal(doc.text(), 'un jeux', here + 'toPlural')
  t.end()
})

// an irregular plural made by toPlural() is not seen as plural afterwards
test('irregular plural round-trip:', function (t) {
  const arr = ['un hibou', 'un caillou', 'un feu', 'un tuyau', 'le genou']
  arr.forEach(function (str) {
    const doc = nlp(str)
    doc.nouns().toPlural()
    doc.nouns().toSingular()
    t.equal(doc.text(), str, here + str)
  })
  t.end()
})
