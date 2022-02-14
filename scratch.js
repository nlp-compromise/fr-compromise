import nlp from './src/index.js'


let text = 'je suis dans la rue'
var dok = nlp(text)
dok.debug()


// proof-of-concept verb-conjugation
let conjugate = dok.methods.one.transform.conjugate
