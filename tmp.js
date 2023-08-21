import verbs from './data/models/verb/present-tense.js'
import lex from './data/lexicon/index.js'
Object.keys(verbs).forEach(k => {
  if (!lex[k]) {
    console.log(k)
  }
})

