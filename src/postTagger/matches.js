const postTagger = function (doc) {
  // l'inconnu
  doc.match('le [#Adjective]', 0).tag('MaleNoun', 'le-adj')
  doc.match('la [#Adjective]', 0).tag('FemaleNoun', 'la-adj')
  doc.match('un [#Adjective]', 0).tag('MaleNoun', 'un-adj')
  doc.match('une [#Adjective]', 0).tag('FemaleNoun', 'une-adj')
  doc.match('se [#Noun]', 0).tag('Verb', 'se-noun')
  doc.match('me [#Noun]', 0).tag('Verb', 'me-noun')
  // numbers
  doc.match('#Value et (un|#Value)').tag('TextValue', 'et-un')
  doc.match('#Value un').tag('TextValue', 'quatre-vingt-un')
}
export default postTagger