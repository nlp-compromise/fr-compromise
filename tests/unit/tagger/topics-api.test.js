import test from 'tape'
import nlp from '../../_lib.js'
const here = '[topics-api] '
nlp.verbose(false)

test('topics empty:', function (t) {
  const doc = nlp('le chat dort sur le lit')
  t.equal(doc.people().found, false, here + 'no people')
  t.equal(doc.places().found, false, here + 'no places')
  t.equal(doc.organizations().found, false, here + 'no organizations')
  t.equal(doc.people().length, 0, here + 'people length')
  t.deepEqual(doc.places().out('array'), [], here + 'places array')
  t.deepEqual(doc.organizations().json(), [], here + 'organizations json')
  t.equal(nlp('').people().found, false, here + 'empty document')
  t.equal(nlp('').places().found, false, here + 'empty document places')
  t.equal(nlp('').organizations().found, false, here + 'empty document orgs')
  t.end()
})

test('topics multi-word:', function (t) {
  // a full name is one result
  const m = nlp('Victor Hugo est né en France').people()
  t.equal(m.length, 1, here + 'one person')
  t.deepEqual(m.out('array'), ['Victor Hugo'], here + 'Victor Hugo')
  // honorific is included
  t.equal(nlp('le Dr Martin est arrivé').people().text(), 'Dr Martin', here + 'honorific')
  t.end()
})

test('topics places commas:', function (t) {
  t.equal(nlp('Paris, France est belle').places().length, 1, here + 'city, country is one place')
  t.equal(nlp('Paris et Lyon').places().length, 2, here + 'two cities')
  t.equal(nlp('je visite Paris, Lyon et Marseille').places().length, 3, here + 'list of cities')
  t.equal(nlp('la France, le Canada').places().length, 2, here + 'list of countries')
  t.end()
})

test('topics in many sentences:', function (t) {
  const doc = nlp('Marie habite à Paris. Pierre travaille chez Google à Londres.')
  t.deepEqual(doc.people().out('array'), ['Marie', 'Pierre'], here + 'people')
  t.deepEqual(doc.places().map(m => m.text('normal')), ['paris', 'londres'], here + 'places')
  t.deepEqual(doc.organizations().out('array'), ['Google'], here + 'organizations')
  // results are normal views
  t.equal(doc.places().first().text('normal'), 'paris', here + 'chainable')
  t.equal(doc.people().if('Marie').length, 1, here + '.if()')
  t.equal(doc.text(), 'Marie habite à Paris. Pierre travaille chez Google à Londres.', here + 'unchanged')
  t.end()
})
