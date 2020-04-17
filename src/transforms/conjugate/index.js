const irregulars = require('./irregulars')

// Verbs ending in -er, like parler
// Verbs ending in -ir, like finir
// Verbs ending in -re, like vendre
const regs = {
  je: [
    [/er$/, 'e'], //jaimer ➔ jaime
    [/ir$/, 'is'], //finir ➔ finis
    [/re$/, 's'], //vendre ➔ vends
    // [/[bdfjlmnprstv]ir$/, 's'], //partir ➔ pars
  ],
  tu: [
    [/er$/, 'es'], //jaimer ➔ jaimes
    [/ir$/, 'is'], //finir ➔ finis
    [/re$/, 's'], //vendre ➔ vends
    // [/[bdfjlmnprstv]ir$/, 's'], //partir ➔ pars
  ],
  on: [
    [/er$/, 'e'], //jaimer ➔ jaime
    [/ir$/, 'it'], //finir ➔ finit
    [/re$/, ''], //vendre ➔ vend
    // [/([bdfjlmnprstv])ir$/, '$1'], //partir ➔ part
  ],
  nous: [
    [/er$/, 'ons'], //jaimer ➔ jaimons
    [/ir$/, 'issons'], //finir ➔ finissons
    [/re$/, 'ons'], //vendre ➔ vendons
    // [/ir$/, 'ons'], //partir ➔ partons
  ],
  vous: [
    [/er$/, 'ez'], //jaimer ➔ jaimez
    [/ir$/, 'issez'], //finir ➔ finissez
    [/re$/, 'ez'], //vendre ➔ vendez
    // [/ir$/, 'ez'], //partir ➔ partez
  ],
  ils: [
    [/er$/, 'ent'], //jaimer ➔ jaiment
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
  return {
    je: transform(str, regs.je),
    tue: transform(str, regs.tu),
    on: transform(str, regs.on),
    nous: transform(str, regs.nous),
    vous: transform(str, regs.vous),
    ils: transform(str, regs.ils),
  }
}
module.exports = conjugate

console.log(conjugate('vendre'))
// console.log(conjugate('grandir'))
