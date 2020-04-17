module.exports = {
  MascAdjective: {
    isA: 'Adjective',
    notA: 'FemmeAdjective',
  },
  FemmeAdjective: {
    isA: 'Adjective',
    notA: 'MascAdjective',
  },
  MascNoun: {
    isA: 'Noun',
    notA: 'FemmeNoun',
    color: 'blue',
  },
  FemmeNoun: {
    isA: 'Noun',
    notA: 'MascNoun',
    color: 'blue',
  },
}
