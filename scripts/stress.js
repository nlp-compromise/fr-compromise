/* eslint-disable no-console, no-unused-vars */
import corpus from 'fr-corpus' //install with `npm i fr-corpus --no-save`
import nlp from '../src/index.js'
const texts = corpus.all()
console.log(`\n\n--- running compromise on ${texts.length.toLocaleString()} random sentences---\n`)
console.log('    --should take a few minutes--')

for (let i = 0; i < texts.length; i++) {
  const txt = texts[i][0]
  const doc = nlp(txt)
  const m = doc.match('#Determiner #Adverb #Adjective #Noun')
  m.forEach(d => {
    d.terms()
  })
  m.verbs().conjugate()
  doc.numbers().add(2)
}

console.log('\n\n - done!')
