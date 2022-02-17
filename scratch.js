import nlp from './src/index.js'


let text = 'je suis dans la rue'
var doc = nlp(text)
// doc.match('stylo').tag('FemaleNoun')
doc.debug()


// proof-of-concept verb-conjugation
let conjugate = doc.methods.one.transform.conjugate
