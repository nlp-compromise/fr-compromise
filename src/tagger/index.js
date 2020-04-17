const steps = {
  lexicon: require('./01-lexicon'),
  emoji: require('./05-emoji'),
  case: require('./02-case'),
  suffix: require('./04-suffixes'),
  contractions: require('./contractions'),
  gender: require('./gender'),
  fallback: require('./fallback'),
  corrections: require('./corrections'),
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
  // titlecase to proper noun
  steps.case(this)
  // tag masc or femme
  steps.gender(terms, world)
  // sentence-based corrections
  steps.corrections(this)
}
module.exports = tagger
