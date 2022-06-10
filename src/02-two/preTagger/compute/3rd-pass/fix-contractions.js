// better guesses for 'le/la/les' in l'foo
const fixContractions = function (terms, i, world) {
  let term = terms[i]
  let tags = term.tags
  if (term.implicit === 'le') {
    let nextTerm = terms[i + 1]
    if (!nextTerm) {
      return null
    }
    if (nextTerm.tags.has('FemaleNoun')) {
      term.implicit = 'la'
    }
    // support female plural?
    if (nextTerm.tags.has('PluralNoun')) {
      term.implicit = 'les'
    }
  }
  return null
}
export default fixContractions