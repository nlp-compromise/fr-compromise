import nlp from './src/index.js'

nlp.verbose('tagger')

let txt = "et boissons fraîches"


/*

*/


// inflection bug
// console.log(nlp('aboyer').verbs().conjugate())


// let doc = nlp('3 cent').debug()
// let doc = nlp('quatre cent quinze ').debug()
// let doc = nlp('quatre cent quinze mille').debug()


// let doc = nlp(`18e`).debug()


// "sanguin": ["sanguine", "sanguins", "sanguines"],

// let doc = nlp(`chaleureux`).debug()
// console.log(doc.adjectives().conjugate())
let doc = nlp(`bois`).debug()
console.log(doc.nouns().conjugate())
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
// doc.match('{empêcher} ').debug()