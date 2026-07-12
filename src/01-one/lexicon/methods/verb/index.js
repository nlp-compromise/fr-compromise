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
const personMap = {
  FirstPerson: 'je',
  SecondPerson: 'tu',
  ThirdPerson: 'il',
  FirstPersonPlural: 'nous',
  SecondPersonPlural: 'vous',
  ThirdPersonPlural: 'ils',
}
const allPersons = ['je', 'tu', 'il', 'nous', 'vous', 'ils']

// reverse a conjugated form to its infinitive.
// the person-tag is a hint - the surface suffix decides, so we
// round-trip each candidate and keep the one that converts back
const doOneVerb = function (str, form, revModel, fwdModel) {
  let keys = allPersons
  let want = personMap[form]
  if (want) {
    keys = [want].concat(allPersons.filter(k => k !== want))
  }
  for (let i = 0; i < keys.length; i += 1) {
    let k = keys[i]
    let inf = convert(str, revModel[k])
    // an unmatched convert() returns its input, which would round-trip trivially
    if (inf && inf !== str && convert(inf, fwdModel[k]) === str) {
      return inf
    }
  }
  return str
}

const toPresentTense = (str) => doVerb(str, model.presentTense)
const toFutureTense = (str) => doVerb(str, model.futureTense)
const toImperfect = (str) => doVerb(str, model.imperfect)

// gaps in the suffix-thumb model
const ppIrregular = {
  pouvoir: 'pu',
  pleuvoir: 'plu',
}
const toPastParticiple = (str) => ppIrregular[str] || convert(str, model.pastParticiple.prt)

// conditional = future stem + imperfect endings
// future forms always end in ai/as/a/ons/ez/ont, so we can derive it
const toConditional = function (str) {
  let f = toFutureTense(str)
  return {
    first: f.first ? f.first.replace(/ai$/, 'ais') : '',
    second: f.second ? f.second.replace(/as$/, 'ais') : '',
    third: f.third ? f.third.replace(/a$/, 'ait') : '',
    firstPlural: f.firstPlural ? f.firstPlural.replace(/ons$/, 'ions') : '',
    secondPlural: f.secondPlural ? f.secondPlural.replace(/ez$/, 'iez') : '',
    thirdPlural: f.thirdPlural ? f.thirdPlural.replace(/ont$/, 'aient') : '',
  }
}

const fromPresent = reverseAll(model.presentTense)
const fromPresentTense = (str, form) => doOneVerb(str, form, fromPresent, model.presentTense)

const fromFuture = reverseAll(model.futureTense)
const fromFutureTense = (str, form) => doOneVerb(str, form, fromFuture, model.futureTense)

const fromImperfect = reverseAll(model.imperfect)
const fromImperfectTense = (str, form) => doOneVerb(str, form, fromImperfect, model.imperfect)

const fromParticiple = reverse(model.pastParticiple.prt)
const ppIrregularRev = { pu: 'pouvoir' }
const fromPastParticiple = (str) => ppIrregularRev[str] || convert(str, fromParticiple)

// map a conditional ending back to its future-tense form, then reverse that
const fromConditional = function (str) {
  let form = 'FirstPerson'
  let s = str
  if (/aient$/.test(s)) {
    s = s.replace(/aient$/, 'ont')
    form = 'ThirdPersonPlural'
  } else if (/ions$/.test(s)) {
    s = s.replace(/ions$/, 'ons')
    form = 'FirstPersonPlural'
  } else if (/iez$/.test(s)) {
    s = s.replace(/iez$/, 'ez')
    form = 'SecondPersonPlural'
  } else if (/ait$/.test(s)) {
    s = s.replace(/ait$/, 'a')
    form = 'ThirdPerson'
  } else if (/ais$/.test(s)) {
    s = s.replace(/ais$/, 'ai')
    form = 'FirstPerson'
  }
  return fromFutureTense(s, form)
}

// do this one manually
const fromPassive = function (str) {
  if (/ée?s?$/.test(str)) {
    return str.replace(/ée?s?$/, 'er')
  }
  // agreement endings on non-er participles: 'venues' -> 'venu', 'prises' -> 'pris'
  let base = str.replace(/([uist])e?s?$/, '$1')
  return fromPastParticiple(base)
}

// i don't really know how this works
const toPassive = function (str) {
  if (str.endsWith('er')) {
    return [
      str.replace(/er$/, 'ées'),
      str.replace(/er$/, 'ée'),
      str.replace(/er$/, 'és'),
      str.replace(/er$/, 'é'),
    ]
  }
  return []
}

// an array of every inflection, for '{inf}' syntax
const all = function (str) {
  let arr = [str].concat(
    Object.values(toPresentTense(str)),
    Object.values(toFutureTense(str)),
    Object.values(toImperfect(str)),
    Object.values(toConditional(str)),
    toPassive(str)
  )
  arr.push(toPastParticiple(str))
  arr = arr.filter(s => s)
  arr = new Set(arr)
  return Array.from(arr)
}

export default {
  all,
  toPresentTense, toFutureTense, toImperfect, toConditional, toPastParticiple,
  fromPresentTense, fromFutureTense, fromImperfectTense, fromConditional, fromPastParticiple, fromPassive
}

// console.log(presentTense('marcher'))
// console.log(futureTense('marcher'))
// console.log(imperfect('marcher'))
// console.log(pastParticiple('marcher'))
// console.log(noun('roche'))
// console.log(adjective('gentil'))