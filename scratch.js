import nlp from './src/index.js'

// nlp.verbose('tagger')

let txt = ''

txt = `les mascarades était prodigieuse`
txt = `une expérience audacieuse`

/*

*/
// console.log(nlp('endommager').verbs().conjugate())
let doc = nlp(txt).debug()
doc.compute('root')
// console.log(doc.docs)
// doc.debug()
doc.match('{audacieux} ').debug()