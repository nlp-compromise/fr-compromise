import { convert, reverse } from 'suffix-thumb'
import model from '../model.js'

let fRev = reverse(model.adjective.female)
let pRev = reverse(model.adjective.plural)
let fpRev = reverse(model.adjective.femalePlural)

// gaps in the suffix-thumb model
const femIrregular = {
  vieux: 'vieille',
  mou: 'molle',
}
const femIrregularRev = Object.entries(femIrregular).reduce((h, [k, v]) => {
  h[v] = k
  return h
}, {})

const toFemale = (str) => femIrregular[str] || convert(str, model.adjective.female)
const toPlural = (str) => convert(str, model.adjective.plural)
// irregular females just add an 's' - vieille -> vieilles
const toFemalePlural = (str) => (femIrregular[str] ? femIrregular[str] + 's' : convert(str, model.adjective.femalePlural))
const fromFemale = (str) => femIrregularRev[str] || convert(str, fRev)
const fromPlural = (str) => convert(str, pRev)
const fromFemalePlural = (str) => {
  if (str.endsWith('s') && femIrregularRev[str.slice(0, -1)]) {
    return femIrregularRev[str.slice(0, -1)]
  }
  return convert(str, fpRev)
}

const conjugate = function (str) {
  return {
    male: str,
    female: toFemale(str),
    plural: toPlural(str),
    femalePlural: toFemalePlural(str),
  }
}

const all = (str) => {
  let arr = Object.values(conjugate(str))
  return arr.filter(s => s)
}

export default {
  all,
  conjugate,
  toFemale,
  toPlural,
  toFemalePlural,
  fromFemale,
  fromPlural,
  fromFemalePlural,
}
// console.log(conjugate('frais'))