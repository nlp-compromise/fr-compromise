import nlp from './src/index.js'

nlp.verbose('tagger')

let txt = "et boissons fraîches"


/*

*/


// inflection bug
// console.log(nlp('aboyer').verbs().conjugate())


// console.log(nlp('aboyer').verbs().conjugate())
let doc = nlp(txt).debug()
doc.compute('root')
console.log(doc.docs[0][3])
// doc.debug()
doc.match('{empêcher} ').debug()