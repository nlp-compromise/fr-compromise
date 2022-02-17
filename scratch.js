import nlp from './src/index.js'


let text = 'je suis dans la éthérés rue'
text = 'évolueront vous achetez'
var doc = nlp(text)
// doc.match('stylo').tag('FemaleNoun')
doc.debug()
// console.log(doc.json()[0].terms)

// proof-of-concept verb-conjugation
// let conjugate = doc.methods.one.transform.conjugate
