import test from 'tape'
import nlp from './_lib.js'
let here = '[conjugate] '
nlp.verbose(false)

test('adj-conjugate:', function (t) {
  let all = ["sanglant", "sanglante", "sanglants", "sanglantes"]
  t.deepEqual(Object.values(nlp(all[0]).adjectives().conjugate()[0]), all, here + 'from-male')
  t.deepEqual(Object.values(nlp(all[1]).adjectives().conjugate()[0]), all, here + 'from-female')
  t.deepEqual(Object.values(nlp(all[2]).adjectives().conjugate()[0]), all, here + 'from-plural')
  t.deepEqual(Object.values(nlp(all[3]).adjectives().conjugate()[0]), all, here + 'from-female-plural')
  t.end()
})

test('noun-conjugate:', function (t) {
  let all = ["cargaison", "cargaisons"]
  let o = nlp(all[0]).nouns().conjugate()[0]
  t.deepEqual([o.singular, o.plural], all, here + 'from-sing')
  o = nlp(all[1]).nouns().conjugate()[0]
  t.deepEqual([o.singular, o.plural], all, here + 'from-plural')

  all = ["bois", "bois"]
  o = nlp(all[0]).nouns().conjugate()[0]
  t.deepEqual([o.singular, o.plural], all, here + 'from-sing')
  t.end()
})

test('verb-conjugate:', function (t) {
  let all = ["endors", "endors", "endort", "endormons", "endormez", "endorment"]
  t.deepEqual(Object.values(nlp(all[0]).verbs().conjugate()[0].PresentTense), all, here + 'from-first')
  t.deepEqual(Object.values(nlp(all[1]).verbs().conjugate()[0].PresentTense), all, here + 'from-2nd')
  t.deepEqual(Object.values(nlp(all[2]).verbs().conjugate()[0].PresentTense), all, here + 'from-3d')
  t.deepEqual(Object.values(nlp(all[3]).verbs().conjugate()[0].PresentTense), all, here + 'from-1p')
  t.deepEqual(Object.values(nlp(all[4]).verbs().conjugate()[0].PresentTense), all, here + 'from-2p')
  t.deepEqual(Object.values(nlp(all[5]).verbs().conjugate()[0].PresentTense), all, here + 'from-3p')
  t.end()
})