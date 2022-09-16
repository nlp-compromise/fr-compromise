import nlp from './src/index.js'

// nlp.verbose('tagger')

let txt = "et boissons fraîches"


/*

*/


// inflection bug
// console.log(nlp('aboyer').verbs().conjugate())


// let doc = nlp('3 cent').debug()
// let doc = nlp('quatre cent quinze ').debug()
let doc = nlp('quatre cent quinze mille').debug()
console.log(doc.values().json())
// let doc = nlp('onzieme').debug()
// doc.compute('root')
// console.log(doc.docs[0][3])
// // doc.debug()
// doc.match('{empêcher} ').debug()