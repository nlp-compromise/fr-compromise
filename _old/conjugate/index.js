const irregulars = require('./irregulars')

// Verbs ending in -er, like parler
// Verbs ending in -ir, like finir
// Verbs ending in -re, like vendre
// https://www.dummies.com/languages/french/how-to-conjugate-regular-french-verbs/
const regs = {
  je: [
    [/er$/, 'e'], //jaimer ➔ jaime
    [/enir$/, 'iens'], //venir ➔ viens
    [/ir$/, 'is'], //finir ➔ finis
    [/re$/, 's'], //vendre ➔ vends
    // [/[bdfjlmnprstv]ir$/, 's'], //partir ➔ pars
  ],
  tu: [
    [/er$/, 'es'], //jaimer ➔ jaimes
    [/enir$/, 'iens'], //venir ➔ viens
    [/ir$/, 'is'], //finir ➔ finis
    [/re$/, 's'], //vendre ➔ vends
    // [/[bdfjlmnprstv]ir$/, 's'], //partir ➔ pars
  ],
  on: [
    [/er$/, 'e'], //jaimer ➔ jaime
    [/enir$/, 'ient'], //venir ➔ vient
    [/ir$/, 'it'], //finir ➔ finit
    [/re$/, ''], //vendre ➔ vend
    // [/([bdfjlmnprstv])ir$/, '$1'], //partir ➔ part
  ],
  nous: [
    [/er$/, 'ons'], //jaimer ➔ jaimons
    [/enir$/, 'enons'], //venir ➔ venons
    [/ir$/, 'issons'], //finir ➔ finissons
    [/re$/, 'ons'], //vendre ➔ vendons
    // [/ir$/, 'ons'], //partir ➔ partons
  ],
  vous: [
    [/er$/, 'ez'], //jaimer ➔ jaimez
    [/enir$/, 'enez'], //venir ➔ venez
    [/ir$/, 'issez'], //finir ➔ finissez
    [/re$/, 'ez'], //vendre ➔ vendez
    // [/ir$/, 'ez'], //partir ➔ partez
  ],
  ils: [
    [/er$/, 'ent'], //jaimer ➔ jaiment
    [/enir$/, 'iennent'], //venir ➔ viennent
    [/ir$/, 'issent'], //finir ➔ finissent
    [/re$/, 'ent'], //vendre ➔ vendent
    // [/ir$/, 'ent'], //partir ➔ partent
  ],
}

// go down a list of replacements, return the first matching one
const transform = function (str, list) {
  for (let i = 0; i < list.length; i += 1) {
    let reg = list[i][0]
    if (reg.test(str) === true) {
      return str.replace(reg, list[i][1])
    }
  }
  return str
}

// turn an infinitive, present verb into all its forms
// assume it's infinitive, first
const conjugate = function (str) {
  let res = irregulars[str] || {}
  res.je = res.je || transform(str, regs.je)
  res.tu = res.tu || transform(str, regs.tu)
  res.on = res.on || transform(str, regs.on)
  res.nous = res.nous || transform(str, regs.nous)
  res.vous = res.vous || transform(str, regs.vous)
  res.ils = res.ils || transform(str, regs.ils)
  return res
}
module.exports = conjugate

// console.log(conjugate('tenir'))
// console.log(conjugate('grandir'))
