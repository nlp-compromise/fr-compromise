import nounGender from '../preTagger/compute/3rd-pass/noun-gender.js'

const tagNoun = function (m) {
  let world = m.world
  m.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      nounGender(terms, i, world)
    })
  })
}

const postTagger = function (doc) {
  // l'inconnu
  doc.match('(le|un) [#Verb]', 0).tag(['MaleNoun', 'Singular'], 'le-verb')
  doc.match('(la|une) [#Verb]', 0).tag(['FemaleNoun', 'Singular'], 'la-verb')
  tagNoun(doc.match('(des|les) [#Verb]', 0).tag('PluralNoun', 'des-verb'))
  // ne foo pas
  doc.match('ne [.] pas', 0).tag('Verb', 'ne-verb-pas')
  // il active le
  doc.match('il [.] (le|la|les)', 0).tag('Verb', 'ne-verb-pas')
  // reflexive
  doc.match('(se|me|te) [.]', 0).tag('Verb', 'se-noun')
  // numbers
  doc.match('#Value et (un|#Value)').tag('TextValue', 'et-un')
  doc.match('#Value un').tag('TextValue', 'quatre-vingt-un')
  doc.match('moins #Value').tag('TextValue', 'moins-value')
  // Elle interdit les transactions
  doc.match('(je|tu|il|elle|nous|vous|ils) [#Adjective] (la|le|les)', 0).tag('Verb', 'ils-x-les')
  // sont interdites par l'interdiction
  doc.match('(est|été|sont|était|serait) [#Adjective] #Preposition', 0).tag('Verb', 'song-x-par')
  // have unpacked
  doc.match('(ai|as|a|avons|avez|ont) [#PresentTense]', 0).tag('PastTense', 'have-pres')

}
export default postTagger