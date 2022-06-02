// guess a plural/singular tag each noun
const nounPlurals = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  let str = term.implicit || term.normal || term.text || ''
  if (tags.has('Noun')) {
    if (tags.has('Pronoun') || tags.has('ProperNoun')) {
      return null
    }
    if (str.endsWith('s')) {
      return setTag([term], 'PluralNoun', world, false, '3-plural-guess')
    }
  }
  return null
}
export default nounPlurals