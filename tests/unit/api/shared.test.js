import test from 'tape'
import nlp from '../../_lib.js'
const here = '[fr-shared] '

// plugins that come from compromise/shared
const txt = 'Marie Curie travaille pour la NASA (à Paris, France); elle écrit à test@x.fr demain.'

test('shared topics:', function (t) {
  const doc = nlp(txt)
  t.deepEqual(doc.people().out('array'), ['Marie'], here + 'people')
  t.deepEqual(doc.organizations().out('array'), ['NASA'], here + 'organizations')
  t.ok(doc.places().found, here + 'places')
  t.equal(doc.topics().length, 3, here + 'topics')
  t.end()
})

test('shared misc:', function (t) {
  const doc = nlp(txt)
  t.equal(doc.parentheses().length, 1, here + 'parentheses')
  t.deepEqual(doc.emails().out('array'), ['test@x.fr'], here + 'emails')
  t.deepEqual(doc.acronyms().out('array'), ['NASA'], here + 'acronyms')
  t.ok(doc.prepositions().found, here + 'prepositions')
  t.end()
})

test('shared clauses:', function (t) {
  const m = nlp(txt).clauses()
  t.ok(m.length > 1, here + 'splits on the semicolon')
  t.equal(m.text(), txt, here + 'keeps all the text')
  t.end()
})

test('shared redact:', function (t) {
  const str = nlp(txt).redact().text()
  t.notOk(/NASA|Marie|test@x\.fr/.test(str), here + 'hides names')
  t.end()
})

test('shared lazy:', function (t) {
  const want = nlp(txt).match('paris').out('array')
  t.equal(want.length, 1, here + 'has a match')
  t.deepEqual(nlp.lazy(txt, 'paris').out('array'), want, here + 'same result as a full parse')
  t.equal(nlp.lazy(txt, 'zzzz').found, false, here + 'no match')
  t.end()
})

// our own rules, in src/03-three/clauses
test('clause word-rules:', function (t) {
  const arr = [
    ['il est grand mais il est lent', ['il est grand', 'mais il est lent']],
    ['elle chante pendant que je travaille', ['elle chante', 'pendant que je travaille']],
    ['si tu viens demain alors nous partirons', ['si tu viens demain', 'alors nous partirons']],
    ['il marque un but et il gagne', ['il marque un but et il gagne']],
  ]
  arr.forEach(a => {
    t.deepEqual(nlp(a[0]).clauses().out('array'), a[1], here + a[0])
  })
  t.end()
})
