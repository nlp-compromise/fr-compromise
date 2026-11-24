import test from 'tape'
import nlp from '../../_lib.js'
const here = '[adjectives] '
nlp.verbose(false)

test('adjective conjugate forms:', function (t) {
  // [male, female, plural, femalePlural]
  const arr = [
    ['petit', 'petite', 'petits', 'petites'],
    ['grand', 'grande', 'grands', 'grandes'],
    ['heureux', 'heureuse', 'heureux', 'heureuses'],
    ['beau', 'belle', 'beaux', 'belles'],
    ['nouveau', 'nouvelle', 'nouveaux', 'nouvelles'],
    ['vieux', 'vieille', 'vieux', 'vieilles'],
    ['blanc', 'blanche', 'blancs', 'blanches'],
    ['actif', 'active', 'actifs', 'actives'],
    ['bon', 'bonne', 'bons', 'bonnes'],
    ['gentil', 'gentille', 'gentils', 'gentilles'],
    ['italien', 'italienne', 'italiens', 'italiennes'],
    ['long', 'longue', 'longs', 'longues'],
    ['premier', 'première', 'premiers', 'premières'],
    ['doux', 'douce', 'doux', 'douces'],
    ['public', 'publique', 'publics', 'publiques'],
    ['sec', 'sèche', 'secs', 'sèches'],
    ['frais', 'fraîche', 'frais', 'fraîches'],
    // already ends in -e
    ['rouge', 'rouge', 'rouges', 'rouges'],
  ]
  arr.forEach(function (a) {
    const o = nlp(a[0]).adjectives().conjugate()[0] || {}
    t.deepEqual([o.male, o.female, o.plural, o.femalePlural], a, here + a[0])
  })
  t.end()
})

test('adjective conjugate from inflected form:', function (t) {
  const arr = [
    ['elles sont petites', 'petit'],
    ['elles sont belles', 'beau'],
    ['elles sont heureuses', 'heureux'],
    ['elle est blanche', 'blanc'],
    ['elle est gentille', 'gentil'],
    ['ils sont nouveaux', 'nouveau'],
  ]
  arr.forEach(function (a) {
    const [str, male] = a
    const res = nlp(str).adjectives().conjugate()
    t.equal(res.length, 1, here + 'one adjective: ' + str)
    t.equal((res[0] || {}).male, male, here + str)
  })
  t.end()
})

test('adjectives nth + empty:', function (t) {
  const doc = nlp('la petite maison est grande')
  t.deepEqual(doc.adjectives().out('array'), ['petite', 'grande'], here + 'finds both')
  t.equal(doc.adjectives(0).text(), 'petite', here + 'nth 0')
  t.equal(doc.adjectives(1).text(), 'grande', here + 'nth 1')
  t.equal(doc.adjectives(9).found, false, here + 'missing nth')
  t.equal(doc.adjectives().conjugate().length, 2, here + 'conjugate all')
  t.equal(doc.adjectives().conjugate(1)[0].male, 'grand', here + 'conjugate(1)')
  t.deepEqual(doc.adjectives().conjugate(9), [], here + 'conjugate(9)')
  // conjugate() doesn't change the document
  t.equal(doc.text(), 'la petite maison est grande', here + 'no side-effects')

  t.equal(nlp('le chat dort').adjectives().found, false, here + 'no adjectives')
  t.deepEqual(nlp('le chat dort').adjectives().conjugate(), [], here + 'conjugate none')
  t.deepEqual(nlp('').adjectives().conjugate(), [], here + 'empty document')
  t.end()
})
