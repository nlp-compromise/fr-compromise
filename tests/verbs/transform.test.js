import test from 'tape'
import nlp from '../_lib.js'
let here = '[verb-transform] '
nlp.verbose(false)

test('verb toPastTense:', function (t) {
  let arr = [
    // regular -er
    ['il mange une pomme', 'il mangeait une pomme'],
    ['elle regarde la télévision', 'elle regardait la télévision'],
    ['je travaille chaque jour', 'je travaillais chaque jour'],
    // regular -re
    ['ils attendent le bus', 'ils attendaient le bus'],
    ['elle vend sa voiture', 'elle vendait sa voiture'],
    // irregular
    ['il est content', 'il était content'],
    ['elle va au marché', 'elle allait au marché'],
    ['nous faisons du pain', 'nous faisions du pain'],
    // from future
    ['elles parleront', 'elles parlaient'],
    // negative
    ['elle ne regarde pas la télévision', 'elle ne regardait pas la télévision'],
    // noun after possessive stays put
    ['tu finis ton devoir', 'tu finissais ton devoir'],
    // contraction expands + re-elides
    [`j'ai un chien`, `j'avais un chien`],
    [`elle n'écoute pas la radio`, `elle n'écoutait pas la radio`],
    // passé composé is already past
    ['il a mangé une pomme', 'il a mangé une pomme'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let doc = nlp(str)
    doc.verbs().toPastTense()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('verb toPresentTense:', function (t) {
  let arr = [
    ['nous mangerons demain', 'nous mangeons demain'],
    ['il jouera au tennis', 'il joue au tennis'],
    ['je mangeais', 'je mange'],
    // from passé composé
    ['il a mangé une pomme', 'il mange une pomme'],
    [`j'ai fini`, 'je finis'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let doc = nlp(str)
    doc.verbs().toPresentTense()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('verb toFutureTense:', function (t) {
  let arr = [
    // regular -er
    ['il mange une pomme', 'il mangera une pomme'],
    ['je parle', 'je parlerai'],
    ['elles chantent', 'elles chanteront'],
    ['elle regarde la télévision', 'elle regardera la télévision'],
    // regular -ir/-re
    ['vous choisissez le rouge', 'vous choisirez le rouge'],
    ['nous vivons en France', 'nous vivrons en France'],
    // irregular
    ['il est content', 'il sera content'],
    ['elle va au marché', 'elle ira au marché'],
    ['ils font du bruit', 'ils feront du bruit'],
    // from imperfect
    ['nous parlions', 'nous parlerons'],
    // from passé composé
    ['il a mangé une pomme', 'il mangera une pomme'],
    ['elle est allée au parc', 'elle ira au parc'],
    [`j'ai fini`, 'je finirai'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let doc = nlp(str)
    doc.verbs().toFutureTense()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('verb json infinitive:', function (t) {
  let arr = [
    ['nous construisons une maison', 'construire'],
    ['elles chantent', 'chanter'],
    ['il finira bientôt', 'finir'],
    ['elle regarde la télévision', 'regarder'],
  ]
  arr.forEach(function (a) {
    let [str, want] = a
    let json = nlp(str).verbs().json()[0]
    t.equal(json.verb.infinitive, want, here + str)
  })
  t.end()
})
