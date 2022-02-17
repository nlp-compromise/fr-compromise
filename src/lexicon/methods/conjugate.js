import models from './models.js'
import { convert } from 'suffix-thumb'
import verbs from './verb-models/index.js'


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


const toPresentTense = function (str) {
  return Object.keys(verbs.toPresent).reduce((h, k) => {
    h[k] = convert(str, verbs.toPresent[k])
    return h
  }, {})
}

const toFutureTense = function (str) {
  return Object.keys(verbs.toFuture).reduce((h, k) => {
    h[k] = convert(str, verbs.toFuture[k])
    return h
  }, {})
}

export default { adjectives, adjToRoot, toPresentTense, toFutureTense }

// console.log(adjectives('superficiel'))
// console.log(adjToRoot('superficielles'))
console.log(toPresentTense('marcher'))
// console.log(toFutureTense('marcher'))