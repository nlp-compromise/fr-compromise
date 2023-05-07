const exceptions = new Set([
  'bras',
  'bus',
  'corps',
  'discours',
  'fils',
  'héros',
  'os',
  'pays',
  'procès',
  'poids',
  'repas',
  'sens',
  'succès',
])
// guess a plural/singular tag each noun
const nounPlurals = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  let str = term.implicit || term.normal || term.text || ''
  if (tags.has('Noun')) {
    if (tags.has('Pronoun') || tags.has('ProperNoun') || tags.has('Uncountable') || tags.has('Date')) {
      return null
    }
    if (exceptions.has(str)) {
      return setTag([term], 'Singular', world, false, '3-plural-guess')
    }
    if (str.endsWith('s') && !str.endsWith('is')) {
      return setTag([term], 'PluralNoun', world, false, '3-plural-guess')
    }
  }
  return null
}
export default nounPlurals