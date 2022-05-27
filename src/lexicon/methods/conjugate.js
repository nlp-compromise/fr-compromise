import { convert, uncompress } from 'suffix-thumb'
import packed from './_data.js'

// uncompress them
let model = Object.keys(packed).reduce((h, k) => {
  h[k] = {}
  Object.keys(packed[k]).forEach(form => {
    h[k][form] = uncompress(packed[k][form])
  })
  return h
}, {})


const doVerb = function (str, m) {
  return {
    first: convert(str, m.je),
    second: convert(str, m.tu),
    third: convert(str, m.il),
    firstPlural: convert(str, m.nous),
    secondPlural: convert(str, m.vous),
    thirdPlural: convert(str, m.ils),
  }
}

const presentTense = (str) => doVerb(str, model.presentTense)
const futureTense = (str) => doVerb(str, model.futureTense)
const imperfect = (str) => doVerb(str, model.imperfect)
const pastParticiple = (str) => convert(str, model.pastParticiple.prt)

const noun = function (str) {
  return {
    male: str,
    female: convert(str, model.noun.female),
    plural: convert(str, model.noun.plural),
    femalePlural: convert(str, model.noun.femalePlural),
  }
}

const adjective = function (str) {
  return {
    male: str,
    female: convert(str, model.adjective.female),
    plural: convert(str, model.adjective.plural),
    femalePlural: convert(str, model.adjective.femalePlural),
  }
}
export default { presentTense, futureTense, imperfect, noun, adjective, pastParticiple }

// console.log(presentTense('marcher'))
// console.log(futureTense('marcher'))
// console.log(imperfect('marcher'))
// console.log(pastParticiple('marcher'))
// console.log(noun('roche'))
// console.log(adjective('gentil'))