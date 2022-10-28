// import nlp from '/Users/spencer/mountain/compromise/src/one.js'
import nlp from 'compromise/one'
import tokenize from './01-one/tokenize/plugin.js'
import lexicon from './01-one/lexicon/plugin.js'
import preTagger from './02-two/preTagger/plugin.js'
import postTagger from './02-two/postTagger/plugin.js'
import tagset from './02-two/tagset/plugin.js'
import numbers from './03-three/numbers/plugin.js'
import topics from './03-three/topics/plugin.js'
import verbs from './03-three/verbs/plugin.js'
import adjectives from './03-three/adjectives/plugin.js'
import nouns from './03-three/nouns/plugin.js'
import contractions from './03-three/contractions/plugin.js'
import version from './_version.js'

nlp.plugin(tokenize)
nlp.plugin(tagset)
nlp.plugin(lexicon)
nlp.plugin(preTagger)
nlp.plugin(postTagger)
nlp.plugin(numbers)
nlp.plugin(topics)
nlp.plugin(verbs)
nlp.plugin(adjectives)
nlp.plugin(nouns)
nlp.plugin(contractions)

const fr = function (txt, lex) {
  let dok = nlp(txt, lex)
  return dok
}

// copy constructor methods over
Object.keys(nlp).forEach(k => {
  if (nlp.hasOwnProperty(k)) {
    fr[k] = nlp[k]
  }
})

// this one is hidden
Object.defineProperty(fr, '_world', {
  value: nlp._world,
  writable: true,
})



/** log the decision-making to console */
fr.verbose = function (set) {
  let env = typeof process === 'undefined' ? self.env || {} : process.env //use window, in browser
  env.DEBUG_TAGS = set === 'tagger' || set === true ? true : ''
  env.DEBUG_MATCH = set === 'match' || set === true ? true : ''
  env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : ''
  return this
}
fr.version = version

export default fr