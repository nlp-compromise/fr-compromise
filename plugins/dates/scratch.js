import nlp from '../../src/index.js'
import plg from './src/plugin.js'
nlp.plugin(plg)

// let txt = 'je suis né le 2 septembre 1982'
// let txt = 'rendez-vous avant vendredi'
// let txt = `je t'appellerai jusqu'en septembre`
// let txt = `15/12/2020`
// let txt = `2020-10-02T07:10:12`
// let txt = `juin 2e`
// let txt = `2021-02-12`
let txt = `je suis né en juin`
// let txt = `ta voiture jusqu’à lundi prochain`
// let txt = `entre sept et oct`
let doc = nlp(txt)//.debug()
let json = doc.dates({ timezone: 'UTC', today: '1998-03-02' }).json({ terms: false })
console.dir(json, { depth: 5 })