import models from './models.js'
import { convert } from 'suffix-thumb'

const adjectives = function (str) {
  return {
    Male: str,
    Female: convert(str, models.adjToF),
    MalePlural: convert(str, models.adjToMp),
    FemalePlural: convert(str, models.adjToFp),
  }
}

const adjToRoot = function (str, form) {
  if (form === 'Female') {
    return convert(str, models.adjFromF)
  }
  if (form === 'MalePlural') {
    return convert(str, models.adjFromMp)
  }
  if (form === 'FemalePlural') {
    return convert(str, models.adjFromFp)
  }
  return str
}








export default { adjectives, adjToRoot }

// console.log(adjectives('superficiel'))
// console.log(adjToRoot('superficielles'))