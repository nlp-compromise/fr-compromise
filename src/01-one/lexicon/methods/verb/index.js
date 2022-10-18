import { convert, reverse } from 'suffix-thumb'
import model from '../model.js'

// ---verbs--
const reverseAll = function (obj) {
  return Object.keys(obj).reduce((h, k) => {
    h[k] = reverse(obj[k])
    return h
  }, {})
}

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
const doOneVerb = function (str, form, m) {
  if (form === 'FirstPerson') {
    return convert(str, m.je)
  }
  if (form === 'SecondPerson') {
    return convert(str, m.tu)
  }
  if (form === 'ThirdPerson') {
    return convert(str, m.il)
  }
  if (form === 'FirstPersonPlural') {
    return convert(str, m.nous)
  }
  if (form === 'SecondPersonPlural') {
    return convert(str, m.vous)
  }
  if (form === 'ThirdPersonPlural') {
    return convert(str, m.ils)
  }
  return str
}

const toPresentTense = (str) => doVerb(str, model.presentTense)
const toFutureTense = (str) => doVerb(str, model.futureTense)
const toImperfect = (str) => doVerb(str, model.imperfect)
const toPastParticiple = (str) => convert(str, model.pastParticiple.prt)

const fromPresent = reverseAll(model.presentTense)
const fromPresentTense = (str, form) => doOneVerb(str, form, fromPresent)

const fromFuture = reverseAll(model.futureTense)
const fromFutureTense = (str, form) => doOneVerb(str, form, fromFuture)

const fromImperfect = reverseAll(model.imperfect)
const fromImperfectTense = (str, form) => doOneVerb(str, form, fromImperfect)

const fromParticiple = reverse(model.pastParticiple.prt)
const fromPastParticiple = (str) => convert(str, fromParticiple)

// do this one manually
const fromPassive = function (str) {
  str = str.replace(/ées$/, 'er')
  str = str.replace(/ée$/, 'er')
  str = str.replace(/és$/, 'er')
  str = str.replace(/é$/, 'er')
  return str
}

// an array of every inflection, for '{inf}' syntax
const all = function (str) {
  let arr = [str].concat(
    Object.values(toPresentTense(str)),
    Object.values(toFutureTense(str)),
    Object.values(toImperfect(str)),
  )
  arr.push(toPastParticiple(str))
  arr = arr.filter(s => s)
  arr = new Set(arr)
  return Array.from(arr)
}

export default {
  all,
  toPresentTense, toFutureTense, toImperfect, toPastParticiple,
  fromPresentTense, fromFutureTense, fromImperfectTense, fromPastParticiple, fromPassive
}

// console.log(presentTense('marcher'))
// console.log(futureTense('marcher'))
// console.log(imperfect('marcher'))
// console.log(pastParticiple('marcher'))
// console.log(noun('roche'))
// console.log(adjective('gentil'))