// better guesses for 'le/la/les' in l'foo
const fixContractions = function (terms, i) {
  let term = terms[i]
  if (term.implicit === 'le' || term.implicit === 'la') {
    let nextTerm = terms[i + 1]
    if (!nextTerm) {
      return null
    }
    if (nextTerm.tags.has('MaleNoun')) {
      term.implicit = 'le'
    } else if (nextTerm.tags.has('FemaleNoun')) {
      term.implicit = 'la'
    }
    if (nextTerm.tags.has('PluralNoun')) {
      term.implicit = 'les'
    }
  }
  return null
}
export default fixContractions
