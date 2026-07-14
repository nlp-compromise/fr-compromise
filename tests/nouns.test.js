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
    // s/x/z-ending nouns are invariable
    ['prix', 'prix'],
    ['nez', 'nez'],
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
    ['le chien', 'le chiens'],
    ['un cheval', 'un chevaux'],
    ['la maison', 'la maisons'],
    ['une pomme', 'une pommes'],
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
    ['des chevaux', 'des cheval'],
    ['les gâteaux', 'les gâteau'],
    ['des animaux', 'des animal'],
    ['des journaux', 'des journal'],
    ['les prix', 'les prix'], //invariable
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
  t.equal(nlp('des chevaux').nouns().isPlural().found, true, here + 'chevaux is plural')
  t.equal(nlp('le prix').nouns().isPlural().found, false, here + 'le prix is singular')
  t.end()
})
