import test from 'tape'
import nlp from '../../_lib.js'
const here = '[verb-parse] '

test('verbs parse:', function (t) {
  let res = nlp('bonjour').verbs().parse()
  t.ok(Array.isArray(res), here + 'empty is array')
  t.deepEqual(res, [], here + 'empty parse')

  res = nlp('il mange').verbs().parse()
  t.ok(Array.isArray(res), here + 'found is array')
  t.equal(res.length, 1, here + 'one verb')

  res = nlp('il mange').verbs().parse(4)
  t.deepEqual(res, [], here + 'missing nth')
  t.end()
})
