import nlp from '../../src/index.js'
import plg from './src/plugin.js'
nlp.plugin(plg)
// nlp.verbose(true)
let arr = [
  'decembre 25, 2012',
  'Juin 5, 2012',
  'hier après-midi',
  '14h30 demain',
  'hier après-midi',
  'aujourd\'hui',
  'hier soir',
  `Novembre 3, 2021`,
  // 'Novembre 3, 2021',
  // '12/01/2018',
  // '13/01/2018',
  // '5/2/2020',
  `le quatorze juillet.`,
  'Mercredi 11 mars',
  `Le 6 avril`,
  `Il n'y a pas d'augmentation prévue jusqu'en 2032`,
  `le 3 novembre 2012`,
  'je suis né le 2 septembre 1982',
  'rendez-vous avant vendredi',
  `je t'appellerai jusqu'en septembre`,
  `15/12/2020`,
  `2020-10-02T07:10:12`,
  `juin 2e`,
  `2021-02-12`,
  `je suis né en juin`,
  `ta voiture jusqu’à lundi prochain`,
  `entre sept et oct`,
]
let doc = nlp(arr[0]).debug()

// let m = doc.match('[<date>#Value] [<month>#Month]')
// m.debug()
// m.groups().date.debug()
// m.groups().month.debug()

let json = doc.dates({ timezone: 'UTC', today: '1998-03-02' }).json({ terms: false })
console.dir(json, { depth: 5 })