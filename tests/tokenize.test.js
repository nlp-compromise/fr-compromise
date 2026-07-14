import test from 'tape'
import nlp from './_lib.js'
let here = '[tokenize] '
nlp.verbose(false)

test('sentence-split:', function (t) {
  t.equal(nlp('Bonjour. Comment ça va? Très bien!').fullSentences().length, 3, here + 'three sentences')
  t.equal(nlp('M. Dupont est arrivé hier.').fullSentences().length, 1, here + 'abbreviation does not split')
  t.equal(nlp('Il pleut... beaucoup').fullSentences().length, 1, here + 'ellipsis does not split')
  t.deepEqual(
    nlp('M. Dupont est arrivé. Il mange.').fullSentences().out('array'),
    ['M. Dupont est arrivé.', 'Il mange.'],
    here + 'split after abbreviation sentence'
  )
  t.end()
})

test('terms:', function (t) {
  let arr = [
    [`j'ai un chien`, [`j'ai`, 'un', 'chien']],
    [`l'école était fermée`, [`l'école`, 'était', 'fermée']],
    ['manges-tu des pommes', ['manges-', 'tu', 'des', 'pommes']],
    ['le grand-père est arrivé', ['le', 'grand-', 'père', 'est', 'arrivé']],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    t.deepEqual(nlp(str).terms().out('array'), want, here + str)
  })
  t.end()
})

test('word-count:', function (t) {
  t.equal(nlp(`j'ai mangé`).wordCount(), 2, here + 'contraction counts once')
  t.equal(nlp('le chien mange').wordCount(), 3, here + 'three words')
  t.end()
})

test('tagging misc:', function (t) {
  t.equal(nlp('la S.N.C.F. est en grève').has('#Acronym'), true, here + 'acronym')
  t.equal(nlp('le 14 juillet 2026').match('#Date+').text(), '14 juillet 2026', here + 'full date')
  t.equal(nlp('nous partons lundi').has('#WeekDay'), true, here + 'weekday')
  t.equal(nlp('née en 1997').has('#Year'), true, here + 'year')
  t.equal(nlp('le premier décembre').has('#Month'), true, here + 'month')
  t.end()
})
