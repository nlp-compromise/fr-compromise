import nounGender from '../preTagger/compute/3rd-pass/noun-gender.js'
import nounPlurals from '../preTagger/compute/3rd-pass/noun-plurals.js'
import adjGender from '../preTagger/compute/3rd-pass/adj-gender.js'
import adjPlurals from '../preTagger/compute/3rd-pass/adj-plurals.js'
import verbTense from '../preTagger/compute/3rd-pass/verb-tense.js'

const tagNoun = function (m) {
  let world = m.world
  m.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      nounGender(terms, i, world)
      nounPlurals(terms, i, world)
    })
  })
}
const tagAdj = function (m) {
  let world = m.world
  m.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      adjGender(terms, i, world)
      adjPlurals(terms, i, world)
    })
  })
}
const tagVerb = function (m) {
  let world = m.world
  m.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      verbTense(terms, i, world)
    })
  })
}

const postTagger = function (doc) {
  // ==Nouns==
  // l'inconnu
  doc.match('(le|un) [#Verb]', 0).tag(['MaleNoun', 'Singular'], 'le-verb')
  doc.match('(la|une) [#Verb]', 0).tag(['FemaleNoun', 'Singular'], 'la-verb')
  tagNoun(doc.match('(quelques|quelque) [#Verb]', 0).tag('Noun', 'quelque-verb'))
  tagNoun(doc.match('(des|les|mes|ces|tes|ses|nos|vos|leurs) [#Verb]', 0).tag('PluralNoun', 'des-verb'))

  // ==Verbs==
  // ne foo pas
  tagVerb(doc.match('ne [.] pas', 0).tag('Verb', 'ne-verb-pas'))
  // il active le
  tagVerb(doc.match('il [.] (le|la|les)', 0).tag('Verb', 'il-verb-le'))
  // reflexive
  tagVerb(doc.match('(se|me|te) [.]', 0).tag('Verb', 'se-noun'))
  // Elle interdit les transactions
  tagVerb(doc.match('(je|tu|il|elle|nous|vous|ils) [#Adjective] (la|le|les)', 0).tag('Verb', 'ils-x-les'))
  // sont interdites par l'interdiction
  tagVerb(doc.match('(est|été|sont|était|serait) [#Adjective] #Preposition', 0).tag('Verb', 'song-x-par'))
  // a dissimulées
  tagVerb(doc.match('(ai|as|a|avons|avez|ont) [#Adjective]', 0).tag('PastTense', 'have-adj'))
  // have unpacked
  doc.match('(ai|as|a|avons|avez|ont) [#PresentTense]', 0).tag('PastTense', 'have-pres')
  // passive voice - est-aimée
  doc.match('#Copula #Adverb?+ [#PastParticiple]', 0).tag('Passive', 'passive-voice')

  // ==Adjectives==
  // est bien calculée
  tagAdj(doc.match('#Copula (bien|très|pas|plus|tant|presque|seulement)+ [#Verb]', 0).tag('Adjective', 'est-bein-calculee'))

  // ==Numbers==
  doc.match('#Value et (un|#Value)').tag('TextValue', 'et-un')
  doc.match('#Value un').tag('TextValue', 'quatre-vingt-un')
  doc.match('moins #Value').tag('TextValue', 'moins-value')

}
export default postTagger