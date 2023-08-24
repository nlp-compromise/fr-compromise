import verbs from './data/lexicon/verbs/infinitives.js'
// import lex from './data/lexicon/index.js'
import nlp from './src/index.js'
verbs.forEach((k) => {
  let doc = nlp(k)
  let obj = doc.verbs().conjugate()[0]
  if (!obj || obj.PresentTense.first === k) {
    console.log(k)
  }
})
