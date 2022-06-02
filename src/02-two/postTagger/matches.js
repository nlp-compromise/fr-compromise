const postTagger = function (doc) {
  // l'inconnu
  // doc.match('le [#Adjective]', 0).tag('MaleNoun', 'le-adj')
  // doc.match('la [#Adjective]', 0).tag('FemaleNoun', 'la-adj')
  // doc.match('un [#Adjective]', 0).tag('MaleNoun', 'un-adj')
  // doc.match('une [#Adjective]', 0).tag('FemaleNoun', 'une-adj')
  // ne foo pas
  doc.match('ne [.] pas', 0).tag('Verb', 'ne-verb-pas')
  // reflexive
  doc.match('(se|me|te) [.]', 0).tag('Verb', 'se-noun')
  // numbers
  doc.match('#Value et (un|#Value)').tag('TextValue', 'et-un')
  doc.match('#Value un').tag('TextValue', 'quatre-vingt-un')
  doc.match('moins #Value').tag('TextValue', 'moins-value')
}
export default postTagger