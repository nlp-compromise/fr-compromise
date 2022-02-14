import nlp from 'compromise/one'
import lexicon from './lexicon/plugin.js'
import tagger from './tagger/plugin.js'
import tagset from './tagset/plugin.js'
nlp.plugin(tagset)
nlp.plugin(lexicon)
nlp.plugin(tagger)

// enable some helpful logging
nlp.verbose('tagger')

const de = function (txt, lex) {
  let dok = nlp(txt, lex)
  return dok
}
export default de