import nlp from '../../src/index.js'
import plg from './src/plugin.js'
nlp.plugin(plg)

// let txt = 'je suis né le 2 septembre 1982'
// let txt = 'rendez-vous avant vendredi'
// let txt = `je t'appellerai jusqu'en septembre`
// let txt = `15/12/2020`
// let txt = `ta voiture jusqu’à lundi prochain`
let txt = `entre sept et oct`
let doc = nlp(txt).debug()
let json = doc.dates().json({ terms: false })
console.dir(json, { depth: 5 })