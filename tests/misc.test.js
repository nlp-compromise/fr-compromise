const test = require('tape')
const nlp = require('./_lib')

test('misc', function (t) {
  let doc = nlp('salut bonjour')
  t.ok(true)
  t.end()
})
