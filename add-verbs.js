import prettyJSON from 'pretty-json-stringify'

import fs from 'fs'
// parse JSON-newline file
let arr = fs.readFileSync('./verbs.jsonl').toString()
  .split(/\n/).filter(str => str).map(str => JSON.parse(str))

let out = {}
arr.forEach(obj => {
  if (obj['Participe Passé'][0]) {
    let str = obj['Participe Passé'][0].replace(/masc.sg.: /, '')
    out[obj.word] = [str]
  }
})
console.log(prettyJSON(out, {
  shouldExpand: (_, level) => level >= 1 ? false : true
}))

import nlp from './src/index.js'
// console.log(nlp('dépister').verbs().conjugate())

let o = {
  "word": "dépister",
  "Indicatif Présent": ["dépiste", "dépistes", "dépiste", "dépistons", "dépistez", "dépistent"],
  "Indicatif Imparfait": ["dépistais", "dépistais", "dépistait", "dépistions", "dépistiez", "dépistaient"],
  "Indicatif Futur": ["dépisterai", "dépisteras", "dépistera", "dépisterons", "dépisterez", "dépisteront"],
  "Indicatif Passé simple": ["dépistai", "dépistas", "dépista", "dépistâmes", "dépistâtes", "dépistèrent"],
  "Indicatif Passé composé": ["ai dépisté", "as dépisté", "a dépisté", "avons dépisté", "avez dépisté", "ont dépisté"],
  "Indicatif Plus-que-parfait": ["avais dépisté", "avais dépisté", "avait dépisté", "avions dépisté", "aviez dépisté", "avaient dépisté"],
  "Indicatif Passé antérieur": ["eus dépisté", "eus dépisté", "eut dépisté", "eûmes dépisté", "eûtes dépisté", "eurent dépisté"],
  "Indicatif Futur antérieur": ["aurai dépisté", "auras dépisté", "aura dépisté", "aurons dépisté", "aurez dépisté", "auront dépisté"],
  "Subjonctif Présent": ["que je dépiste", "que tu dépistes", "qu'il/elle dépiste", "que nous dépistions", "que vous dépistiez", "qu'ils/elles dépistent"],
  "Subjonctif Imparfait": ["que je dépistasse", "que tu dépistasses", "qu'il/elle dépistât", "que nous dépistassions", "que vous dépistassiez", "qu'ils/elles dépistassent"],
  "Subjonctif Plus-que-parfait": ["que j'eusse dépisté", "que tu eusses dépisté", "qu'il/elle eût dépisté", "que nous eussions dépisté", "que vous eussiez dépisté", "qu'ils/elles eussent dépisté"],
  "Subjonctif Passé": ["que j'aie dépisté", "que tu aies dépisté", "qu'il/elle ait dépisté", "que nous ayons dépisté", "que vous ayez dépisté", "qu'ils/elles aient dépisté"],
  "Conditionnel Présent": ["dépisterais", "dépisterais", "dépisterait", "dépisterions", "dépisteriez", "dépisteraient"],
  "Conditionnel Passé première forme": ["aurais dépisté", "aurais dépisté", "aurait dépisté", "aurions dépisté", "auriez dépisté", "auraient dépisté"],
  "Conditionnel Passé deuxième forme": ["eusse dépisté", "eusses dépisté", "eût dépisté", "eussions dépisté", "eussiez dépisté", "eussent dépisté"],
  "Participe Présent": ["dépistant"],
  "Participe Passé composé": ["ayant dépisté"],
  "Participe Passé": ["masc.sg.: dépisté", "masc.pl.: dépistés", "fém.sg.: dépistée", "fém.pl.: dépistées"],
  "Impératif Présent": ["dépiste", "dépistons", "dépistez"],
  "Impératif Passé": ["aie dépisté", "ayons dépisté", "ayez dépisté"],
  "Infinitif Présent": ["dépister"],
  "Infinitif Passé": ["avoir dépisté"]
}
