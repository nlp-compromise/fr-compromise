import { convert, reverse } from 'suffix-thumb'
import model from '../model.js'

// let fRev = reverse(model.noun.female)
let pRev = reverse(model.noun.plural)
let fpRev = reverse(model.noun.femalePlural)

// const toFemale = (str) => convert(str, model.noun.female)
const toPlural = (str) => convert(str, model.noun.plural)
const toFemalePlural = (str) => convert(str, model.noun.femalePlural)
// const fromFemale = (str) => convert(str, fRev)
const fromPlural = (str) => convert(str, pRev)
const fromFemalePlural = (str) => convert(str, fpRev)


export default {
  // conjugate,
  // toFemale,
  toPlural,
  toFemalePlural,
  // fromFemale,
  fromPlural,
  fromFemalePlural,
}