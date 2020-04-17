const steps = {
  lexicon: require('./01-lexicon'),
  emoji: require('./05-emoji'),
  suffix: require('./04-suffixes'),
  contractions: require('./contractions'),
  gender: require('./gender'),
  fallback: require('./fallback'),
}
const tagger = function () {
  // replace l'amour with 'le amour'
  steps.contractions(this)

  let terms = this.termList()
  let world = this.world
  //our list of known-words
  steps.lexicon(terms, world)

  for (let i = 0; i < terms.length; i += 1) {
    let term = terms[i]
    //guess by suffix
    steps.suffix(term, world)
    //emoji and emoticons
    steps.emoji(term, world)
    // assume noun, if unknown
    steps.fallback(term, world)
  }
  // tag masc or femme
  steps.gender(terms, world)
}
module.exports = tagger
