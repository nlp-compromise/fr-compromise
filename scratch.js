import nlp from './src/index.js'
// nlp.verbose('tagger')
/*

*/


let txt = 'je suis né le 2 septembre 1982'
// let txt = 'je suis né le 1er septembre 1982'
let doc = nlp(txt)//.debug()
let json = doc.dates().json({ terms: false })
console.dir(json, { depth: 5 })