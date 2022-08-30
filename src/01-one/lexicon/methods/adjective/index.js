import { convert, reverse } from 'suffix-thumb'
import model from '../model.js'

let fRev = reverse(model.adjective.female)
let pRev = reverse(model.adjective.plural)
let fpRev = reverse(model.adjective.femalePlural)

const toFemale = (str) => convert(str, model.adjective.female)
const toPlural = (str) => convert(str, model.adjective.plural)
const toFemalePlural = (str) => convert(str, model.adjective.femalePlural)
const fromFemale = (str) => convert(str, fRev)
const fromPlural = (str) => convert(str, pRev)
const fromFemalePlural = (str) => convert(str, fpRev)

const conjugate = function (str) {
  return {
    male: str,
    female: toFemale(str),
    plural: toPlural(str),
    femalePlural: toFemalePlural(str),
  }
}

export default {
  conjugate,
  toFemale,
  toPlural,
  toFemalePlural,
  fromFemale,
  fromPlural,
  fromFemalePlural,
}
// console.log(fromFemale('audacieuse'))