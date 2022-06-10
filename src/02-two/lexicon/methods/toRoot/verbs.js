import { convert, uncompress, reverse } from 'suffix-thumb'
import model from '../_data.js'

// ---verbs--
const reverseAll = function (obj) {
  return Object.keys(obj).reduce((h, k) => {
    h[k] = uncompress(obj[k])
    h[k] = reverse(h[k])
    return h
  }, {})
}







const doVerb = function (str, form, mod) {
  let forms = {
    FirstPerson: () => convert(str, mod.je),
    SecondPerson: () => convert(str, mod.tu),
    ThirdPerson: () => convert(str, mod.il),
    FirstPersonPlural: () => convert(str, mod.nous),
    SecondPersonPlural: () => convert(str, mod.vous),
    ThirdPersonPlural: () => convert(str, mod.ils),
  }
  if (forms.hasOwnProperty(form)) {
    return forms[form](str)
  }
  return str
}

const fromPresent = reverseAll(model.presentTense)
const fromPresentTense = (str, form) => doVerb(str, form, fromPresent)

const fromFuture = reverseAll(model.futureTense)
const fromFutureTense = (str, form) => doVerb(str, form, fromFuture)

const fromImperfect = reverseAll(model.imperfect)
const fromImperfectTense = (str, form) => doVerb(str, form, fromImperfect)

const fromParticiple = reverse(uncompress(model.pastParticiple.prt))
const fromPastParticiple = (str) => convert(str, fromParticiple)

export default { fromPresentTense, fromFutureTense, fromImperfectTense, fromPastParticiple }

// console.log(fromPastParticiple('gelé'))

//   "jeter": ["jette", "jettes", "jette", "jetons", "jetez", "jettent"],
// console.log(fromPresentTense('jette', 'first'))
// console.log(fromPresentTense('jettes', 'second'))
// console.log(fromPresentTense('jette', 'third'))
// console.log(fromPresentTense('jetons', 'firstPlural'))
// console.log(fromPresentTense('jetez', 'secondPlural'))
// console.log(fromPresentTense('jettent', 'thirdPlural'))