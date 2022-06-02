// guess a gender for each noun
const nounGender = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  const guessGender = world.methods.one.guessGender
  let { tags } = terms[i]
  if (tags.has('Noun') && !tags.has('MaleNoun') && !tags.has('FemaleNoun')) {
    let term = terms[i]
    // should these have genders?
    if (tags.has('ProperNoun') || tags.has('Pronoun') || tags.has('Possessive')) {
      return null
    }
    // look for 'le', look for suffix
    let found = guessGender(terms, i)
    if (found) {
      return setTag([term], found, world, false, '3-noun-gender')
    }
  }
  return null
}
export default nounGender