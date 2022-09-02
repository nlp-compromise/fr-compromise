import nlp from './src/index.js'

nlp.verbose('tagger')

let txt = ''

txt = `géante est réveillée ` //{réveiller}
txt = `la princesse était douce ` //{précieux}

/*
*/
// console.log(nlp('endormir').verbs().conjugate())
let doc = nlp(txt).debug()
doc.compute('root')
console.log(doc.docs[0])
// doc.debug()
doc.match('{doux} ').debug()