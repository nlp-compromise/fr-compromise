// the match-engine looks at term.machine, so it must agree with our new guess
const setImplicit = function (term, word) {
  term.implicit = word
  term.machine = word
}

// better guesses for 'le/la/les' in l'foo
const fixContractions = function (terms, i) {
  let term = terms[i]
  if (term.implicit === 'le' || term.implicit === 'la') {
    let nextTerm = terms[i + 1]
    if (!nextTerm) {
      return null
    }
    if (nextTerm.tags.has('MaleNoun')) {
      setImplicit(term, 'le')
    } else if (nextTerm.tags.has('FemaleNoun')) {
      setImplicit(term, 'la')
    }
    if (nextTerm.tags.has('PluralNoun')) {
      setImplicit(term, 'les')
    }
  }
  return null
}
export default fixContractions
