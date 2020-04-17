const fixGender = function (doc) {
  // use la/le cue for noun gender
  doc.match('le [#Noun+]', 0).tag('MascNoun', 'le-noun')
  doc.match('la [#Noun+]', 0).tag('FemmeNoun', 'la-noun')
}
module.exports = fixGender
