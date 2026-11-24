import test from 'tape'
import nlp from '../../_lib.js'
const here = '[nouns-api] '
nlp.verbose(false)

test('noun-conjugate plural exceptions:', function (t) {
  const arr = [
    // -ou takes an -s, except for a few
    ['hibou', 'hiboux'],
    ['caillou', 'cailloux'],
    ['genou', 'genoux'],
    // -eu/-au take an -x, except for a few
    ['feu', 'feux'],
    ['cheveu', 'cheveux'],
    ['tuyau', 'tuyaux'],
    ['pneu', 'pneus'],
    // -al becomes -aux, except for a few
    ['animal', 'animaux'],
    ['bal', 'bals'],
    ['festival', 'festivals'],
    // -ail is mostly regular
    ['détail', 'détails'],
    ['monsieur', 'messieurs'],
    // invariable
    ['bois', 'bois'],
    ['voix', 'voix'],
    ['gaz', 'gaz'],
    ['souris', 'souris'],
  ]
  arr.forEach(function (a) {
    const [singular, plural] = a
    const o = nlp('un ' + singular).nouns().conjugate()[0] || {}
    t.deepEqual([o.singular, o.plural], [singular, plural], here + singular)
  })
  t.end()
})

test('noun-conjugate from plural:', function (t) {
  const arr = [
    ['les chiens', 'chien', 'chiens'],
    ['des hiboux', 'hibou', 'hiboux'],
    ['les genoux', 'genou', 'genoux'],
    ['les tuyaux', 'tuyau', 'tuyaux'],
    ['des travaux', 'travail', 'travaux'],
    ['les messieurs', 'monsieur', 'messieurs'],
  ]
  arr.forEach(function (a) {
    const [str, singular, plural] = a
    const o = nlp(str).nouns().conjugate()[0] || {}
    t.deepEqual([o.singular, o.plural], [singular, plural], here + str)
  })
  t.end()
})

test('nouns nth:', function (t) {
  const str = 'le chat et le chien'
  t.deepEqual(nlp(str).nouns().out('array'), ['chat', 'chien'], here + 'finds both')
  t.equal(nlp(str).nouns(0).text(), 'chat', here + 'nouns(0)')
  t.equal(nlp(str).nouns(1).text(), 'chien', here + 'nouns(1)')
  t.equal(nlp(str).nouns(5).found, false, here + 'nouns(5)')
  t.deepEqual(nlp(str).nouns().conjugate(1), [{ singular: 'chien', plural: 'chiens' }], here + 'conjugate(1)')
  t.deepEqual(nlp(str).nouns().conjugate(5), [], here + 'conjugate(5)')

  let doc = nlp(str)
  doc.nouns(1).toPlural()
  t.equal(doc.text(), 'le chat et le chiens', here + 'nouns(1).toPlural()')

  doc = nlp(str)
  doc.nouns().toPlural(0)
  t.equal(doc.text(), 'le chats et le chien', here + 'toPlural(0)')

  doc = nlp('les chats et les chiens')
  doc.nouns().toSingular(0)
  t.equal(doc.text(), 'les chat et les chiens', here + 'toSingular(0)')

  doc = nlp('les chats et le chien')
  t.equal(doc.nouns().isPlural(0).found, true, here + 'isPlural(0)')
  t.equal(doc.nouns().isPlural(1).found, false, here + 'isPlural(1)')
  t.deepEqual(doc.nouns().isPlural().out('array'), ['chats'], here + 'isPlural()')
  t.end()
})

test('nouns no-ops:', function (t) {
  // already plural
  let doc = nlp('les chiens aboient')
  doc.nouns().toPlural()
  t.equal(doc.text(), 'les chiens aboient', here + 'toPlural on plural')
  // already singular
  doc = nlp('le chien aboie')
  doc.nouns().toSingular()
  t.equal(doc.text(), 'le chien aboie', here + 'toSingular on singular')
  // nothing found
  doc = nlp('très vite')
  t.equal(doc.nouns().toPlural().found, false, here + 'toPlural none')
  t.equal(doc.nouns().toSingular().found, false, here + 'toSingular none')
  t.deepEqual(doc.nouns().conjugate(), [], here + 'conjugate none')
  t.equal(doc.text(), 'très vite', here + 'unchanged')
  // empty document
  t.equal(nlp('').nouns().found, false, here + 'empty document')
  t.deepEqual(nlp('').nouns().conjugate(), [], here + 'empty conjugate')
  t.end()
})

test('nouns keep punctuation + sentences:', function (t) {
  let doc = nlp('un chat, un chien.')
  doc.nouns().toPlural()
  t.equal(doc.text(), 'un chats, un chiens.', here + 'toPlural keeps punctuation')

  doc = nlp('Les chats dorment. Les chiens jouent!')
  doc.nouns().toSingular()
  t.equal(doc.text(), 'Les chat dorment. Les chien jouent!', here + 'toSingular in two sentences')

  doc = nlp('le chat noir. Les chiens blancs.')
  t.equal(doc.nouns().length, 2, here + 'one noun per sentence')
  t.equal(doc.nouns().json().length, 2, here + 'json length')
  // round-trip
  doc = nlp('le chat mange')
  doc.nouns().toPlural()
  doc.nouns().toSingular()
  t.equal(doc.text(), 'le chat mange', here + 'plural and back')
  t.end()
})
