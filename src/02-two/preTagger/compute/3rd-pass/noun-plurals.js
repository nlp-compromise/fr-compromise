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
// determiners that give-away the noun's number
const pluralDets = new Set(['les', 'des', 'ces', 'quelques', 'plusieurs', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs'])
const singularDets = new Set(['le', 'la', 'un', 'une', 'ce', 'cet', 'cette', 'chaque', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'notre', 'votre', 'leur', 'du'])

// plural nouns almost always end in s/x/z
const pluralEnd = /[sxz]$/

// guess a plural/singular tag each noun
const nounPlurals = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  let str = term.implicit || term.normal || term.text || ''
  if (tags.has('Noun')) {
    if (tags.has('Pronoun') || tags.has('ProperNoun') || tags.has('Uncountable') || tags.has('Date') || tags.has('Possessive')) {
      return null
    }
    // 'les chevaux', 'le prix' - trust the determiner over any suffix-guess
    if (terms[i - 1]) {
      let lastStr = terms[i - 1].implicit || terms[i - 1].normal
      if (pluralDets.has(lastStr)) {
        return setTag([term], 'PluralNoun', world, false, '3-plural-det')
      }
      if (singularDets.has(lastStr)) {
        return setTag([term], 'Singular', world, false, '3-singular-det')
      }
    }
    if (exceptions.has(str)) {
      return setTag([term], 'Singular', world, false, '3-plural-guess')
    }
    if (str.endsWith('s') && !str.endsWith('is')) {
      return setTag([term], 'PluralNoun', world, false, '3-plural-guess')
    }
    // 'chien', 'maison' - no plural-looking ending
    if (!pluralEnd.test(str)) {
      return setTag([term], 'Singular', world, false, '3-singular-guess')
    }
  }
  return null
}
export default nounPlurals