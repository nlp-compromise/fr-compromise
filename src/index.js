// import nlp from 'compromise/one'
import nlp from '/Users/spencer/mountain/compromise/src/one.js'
import tokenize from './01-one/tokenize/plugin.js'
import lexicon from './02-two/lexicon/plugin.js'
import preTagger from './02-two/preTagger/plugin.js'
import postTagger from './02-two/postTagger/plugin.js'
import tagset from './02-two/tagset/plugin.js'
import numbers from './03-three/numbers/plugin.js'
import topics from './03-three/topics/plugin.js'
import contractions from './03-three/contractions/plugin.js'

nlp.plugin(tokenize)
nlp.plugin(tagset)
nlp.plugin(lexicon)
nlp.plugin(preTagger)
nlp.plugin(postTagger)
nlp.plugin(numbers)
nlp.plugin(topics)
nlp.plugin(contractions)

const fr = function (txt, lex) {
  let dok = nlp(txt, lex)
  return dok
}

/** log the decision-making to console */
fr.verbose = function (set) {
  let env = typeof process === 'undefined' ? self.env || {} : process.env //use window, in browser
  env.DEBUG_TAGS = set === 'tagger' || set === true ? true : ''
  env.DEBUG_MATCH = set === 'match' || set === true ? true : ''
  env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : ''
  return this
}

export default fr