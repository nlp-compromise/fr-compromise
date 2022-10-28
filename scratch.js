import nlp from './src/index.js'
// nlp.verbose('tagger')
let txt = "et boissons fraîches"
/*

*/


// inflection bug
// console.log(nlp('aboyer').verbs().conjugate())


// let doc = nlp('moins dix huitieme').debug()
// let doc = nlp('quatre cent quinze ').debug()
// let doc = nlp('33e').debug().numbers().add(1)
// console.log(doc.text())
// console.log(doc.numbers().json())


const buildNet = function (words) {
  let matches = words.map(doc => {
    let w = doc.lemon
    return { match: `{${w}/${doc.pos}}`, val: doc.id }
  })
  console.log(matches)
  let net = nlp.buildNet(matches)
  return net
}

let words = [{
  "id": "yell-verb-01",
  "pos": "Verb",
  "lemon": "crier"
},
{
  "id": "yellow-adjective-01",
  "pos": "Adjective",
  "lemon": "jaune"
},
{
  "id": "wire-noun-01",
  "pos": "Noun",
  "lemon": "fil"
}]
console.log(buildNet(words))
// let doc = nlp(`18e`).debug()


// "sanguin": ["sanguine", "sanguins", "sanguines"],

// let doc = nlp(`chaleureux`).debug()
// console.log(doc.adjectives().conjugate())
// let doc = nlp(`La production a cessé en octobre.`)
// console.log(nlp.parseMatch('{cesser}'))
// doc.match('{cesser}').debug()
// let doc = nlp(`j'ai moins quarante dollars`).debug()
// doc.numbers().add(50)
// console.log(doc.text())


// console.log(doc.numbers().get())
// console.log(doc.text())
// console.log(doc.values().json())
// let doc = nlp('onzieme').debug()
// doc.compute('root')
// console.log(doc.docs[0][3])
// // doc.debug()