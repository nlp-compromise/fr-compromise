import nlp from './src/index.js'

nlp.verbose('tagger')

let txt = ''

txt = `géante est réveillée ` //{réveiller}
txt = `vous exécutez qu'il active la version` //{précieux}

/*
*/
// console.log(nlp('endormir').verbs().conjugate())
let doc = nlp(txt).debug()
doc.compute('root')
// console.log(doc.docs[0])
// doc.debug()
doc.match('{activer} ').debug()