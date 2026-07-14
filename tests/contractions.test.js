import test from 'tape'
import nlp from './_lib.js'
let here = '[contractions] '
nlp.verbose(false)

test('contraction implicit-text:', function (t) {
  let arr = [
    [`j'ai un chien`, 'je ai un chien'],
    [`c'est la vie`, 'ce est la vie'],
    [`qu'il pleuve`, 'que il pleuve'],
    [`n'est pas`, 'ne est pas'],
    [`d'une femme`, 'de une femme'],
    [`je vais au marché`, 'je vais à le marché'],
    [`il parle aux enfants`, 'il parle à les enfants'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let doc = nlp(str)
    t.equal(doc.text('implicit'), want, here + str)
  })
  t.end()
})

test('contraction unicode-apostrophe:', function (t) {
  // curly apostrophes should tokenize the same as straight ones
  t.equal(nlp(`j’ai un chien`).text('implicit'), 'je ai un chien', here + 'j’ai')
  t.equal(nlp(`l’homme est grand`).text('implicit'), 'le homme est grand', here + 'l’homme')
  t.end()
})

test('contraction match-through:', function (t) {
  let arr = [
    [`j'ai un chien`, 'je ai'],
    [`j'ai un chien`, 'je'],
    [`c'est la vie`, 'ce est'],
    [`je vais au marché`, 'à le marché'],
    [`il parle aux enfants`, 'à les enfants'],
    [`auquel il pense`, 'à lequel'],
    [`la maison duquel je parle`, 'de lequel'],
  ]
  arr.forEach(function (a) {
    let [str, match] = a
    t.equal(nlp(str).has(match), true, here + `'${str}' has '${match}'`)
  })
  t.end()
})

test('contraction expand:', function (t) {
  let arr = [
    [`j'ai un chien`, 'je ai un chien'],
    [`n'est pas mal`, 'ne est pas mal'],
    [`d'une femme`, 'de une femme'],
    [`qu'il pleuve`, 'que il pleuve'],
    [`C'est la vie`, 'Ce est la vie'], //keeps title-case
    [`L'homme est grand`, 'Le homme est grand'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let doc = nlp(str)
    doc.contractions().expand()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('contraction found:', function (t) {
  t.equal(nlp(`j'ai un chien`).contractions().length, 1, here + 'one contraction')
  t.equal(nlp(`le chien mange`).contractions().length, 0, here + 'no contractions')
  t.end()
})
