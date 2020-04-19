const toSingular = require('./toSingular')
const toPlural = require('./toPlural')
const toMasc = require('./toMasc')
const toFemme = require('./toFemme')

// here root means singular, masculine
const toRoot = function (str) {
  str = toSingular(str)
  str = toMasc(str)
  return str
}

const inflect = function (str) {
  let root = toRoot(str)
  let res = {
    masc: root,
    femme: toFemme(root),
  }
  res.pluralMasc = toPlural(root)
  res.pluralFemme = toPlural(res.femme)
  return res
}
module.exports = inflect

console.log(inflect('tigres'))
