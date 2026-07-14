import test from 'tape'
import nlp from './_lib.js'
let here = '[nouns] '
nlp.verbose(false)

test('noun-conjugate irregular-plurals:', function (t) {
  let arr = [
    ['cheval', 'chevaux'],
    ['journal', 'journaux'],
    ['gâteau', 'gâteaux'],
    ['chapeau', 'chapeaux'],
    ['bijou', 'bijoux'],
    ['travail', 'travaux'],
    ['œil', 'yeux'],
    ['eau', 'eaux'],
  ]
  arr.forEach(function (a) {
    let [singular, plural] = a
    let o = nlp(singular).nouns().conjugate()[0]
    t.deepEqual([o.singular, o.plural], [singular, plural], here + singular)
  })
  t.end()
})

test('noun toPlural:', function (t) {
  let arr = [
    ['un journal', 'un journaux'],
    ['le bureau', 'le bureaux'],
    ['un animal', 'un animaux'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let doc = nlp(str)
    doc.nouns().toPlural()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('noun toSingular:', function (t) {
  let arr = [
    ['les chiens aboient', 'les chien aboient'],
    ['les maisons', 'les maison'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let doc = nlp(str)
    doc.nouns().toSingular()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('noun isPlural:', function (t) {
  t.equal(nlp('les chiens').nouns().isPlural().found, true, here + 'chiens is plural')
  t.equal(nlp('le chien').nouns().isPlural().found, false, here + 'chien is not plural')
  t.equal(nlp('les maisons').nouns().isPlural().found, true, here + 'maisons is plural')
  t.end()
})
