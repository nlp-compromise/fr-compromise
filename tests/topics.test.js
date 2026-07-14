import test from 'tape'
import nlp from './_lib.js'
let here = '[topics] '
nlp.verbose(false)

test('topics people:', function (t) {
  let arr = [
    ['Emmanuel Macron habite à Paris', 'Emmanuel'],
    ['Marie Curie était une scientifique', 'Marie'],
    ['Jean parle avec Pierre', 'Pierre'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let found = nlp(str).people()
    t.equal(found.found, true, here + str)
    t.equal(found.has(want), true, here + `'${str}' has '${want}'`)
  })
  t.end()
})

test('topics places:', function (t) {
  let arr = [
    ['elle habite à Paris', ['Paris']],
    ['le Canada est grand', ['Canada']],
    ['je visite la France et le Japon', ['France', 'Japon']],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let found = nlp(str).places().out('array')
    t.deepEqual(found, want, here + str)
  })
  t.end()
})

test('topics organizations:', function (t) {
  let arr = [
    ['il travaille chez Google', ['Google']],
    ['la NASA a lancé une fusée', ['NASA']],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let found = nlp(str).organizations().out('array')
    t.deepEqual(found, want, here + str)
  })
  t.end()
})
