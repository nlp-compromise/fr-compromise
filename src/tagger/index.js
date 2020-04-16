const steps = {
  lexicon: require('./01-lexicon'),
  emoji: require('./05-emoji'),
  suffix: require('./04-suffixes'),
  contractions: require('./contractions'),
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
  }

  console.log('hello ')
}
module.exports = tagger
