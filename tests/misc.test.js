const test = require('tape')
const nlp = require('./_lib')

test('pos-basic-tag:', function (t) {
  let arr = [
    ['la foobar', ['Determiner', 'FemmeNoun']],
    ['le foobar', ['Determiner', 'MascNoun']],
    ['John al Foobar', ['FirstName', 'Person', 'Person']],
  ]
  arr.forEach(function (a) {
    let terms = nlp(a[0]).json(0).terms
    terms.forEach((term, i) => {
      let tag = a[1][i]
      let found = term.tags.some((tg) => tg === tag)
      t.equal(found, true, a[0] + '  - ' + term.text + ' ' + tag)
    })
  })
  t.end()
})
