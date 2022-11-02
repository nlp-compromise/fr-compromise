/* eslint-disable no-console, no-unused-vars */
import corpus from 'fr-corpus' //install with `npm i fr-corpus --no-save`
import nlp from '../src/index.js'
let texts = corpus.all()
console.log(`\n\n--- running compromise on ${texts.length.toLocaleString()} random sentences---\n`)
console.log('    --should take a few minutes--')

for (let i = 0; i < texts.length; i++) {
  let txt = texts[i][0]
  let doc = nlp(txt)
  let m = doc.match('#Determiner #Adverb #Adjective #Noun')
  m.forEach(d => {
    d.terms()
  })
  m.verbs().conjugate()
  doc.numbers().add(2)
}

console.log('\n\n - done!')
