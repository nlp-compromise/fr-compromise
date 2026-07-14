import test from 'tape'
import nlp from '../_lib.js'
let here = '[conjugate-tenses] '
nlp.verbose(false)

test('conjugate all-tenses:', function (t) {
  let o = nlp('manger').verbs().conjugate()[0]
  t.equal(o.Infinitive, 'manger', here + 'infinitive')
  t.equal(o.PastParticiple, 'mangé', here + 'past-participle')
  t.deepEqual(
    Object.values(o.PresentTense),
    ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'],
    here + 'present'
  )
  t.deepEqual(
    Object.values(o.Imperfect),
    ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient'],
    here + 'imperfect'
  )
  t.deepEqual(
    Object.values(o.FutureTense),
    ['mangerai', 'mangeras', 'mangera', 'mangerons', 'mangerez', 'mangeront'],
    here + 'future'
  )
  t.deepEqual(
    Object.values(o.Conditional),
    ['mangerais', 'mangerais', 'mangerait', 'mangerions', 'mangeriez', 'mangeraient'],
    here + 'conditional'
  )
  t.end()
})

test('conjugate irregulars:', function (t) {
  let arr = [
    ['être', ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], 'été'],
    ['avoir', ['ai', 'as', 'a', 'avons', 'avez', 'ont'], 'eu'],
    ['aller', ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], 'allé'],
    ['faire', ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], 'fait'],
  ]
  arr.forEach(function (a) {
    let [inf, present, part] = a
    let o = nlp(inf).verbs().conjugate()[0]
    t.deepEqual(Object.values(o.PresentTense), present, here + inf + ' present')
    t.equal(o.PastParticiple, part, here + inf + ' participle')
  })
  t.end()
})
