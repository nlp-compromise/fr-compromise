import test from 'tape'
import nlp from '../_lib.js'
const here = '[contractions-hmm] '

// expand() writes the lowercased implicit form, so proper-nouns lose their capital
test('expand keeps proper-noun case:', function (t) {
  const doc = nlp(`l'ami d'Émile`)
  doc.contractions().expand()
  t.equal(doc.text(), `le ami de Émile`, here + `d'Émile`)
  t.end()
})

// expand() on a view holding only half of a contraction leaves the document garbled
test('expand from half a contraction:', function (t) {
  const doc = nlp(`j'aime l'été`)
  doc.match('été').contractions().expand()
  t.equal(doc.text(), `j'aime le été`, here + 'second half')
  t.end()
})

// 'before' rules skip remainders shorter than 3 chars - "lorsqu'il", "s'il", "jusqu'à"
test('short elisions:', function (t) {
  const arr = [
    [`lorsqu'il vient`, 'lorsque il vient'],
    [`s'il vient`, 'si il vient'],
    [`jusqu'à demain`, 'jusque à demain'],
    [`quelqu'un vient`, 'quelque un vient'],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    t.equal(nlp(str).text('implicit'), want, here + str)
    t.equal(nlp(str).contractions().length, 1, here + 'found: ' + str)
  })
  t.end()
})
