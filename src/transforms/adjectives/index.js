const toMasc = require('./toMasc')
const toFemme = require('./toFemme')
const toPlural = require('./toPlural')
const toSingular = require('./toSingular')

// conjugate a masculine-form adjective to all its other forms
const conjugate = function (str) {
  let root = toMasc(str)
  root = toSingular(root)

  let res = {
    masc: root,
    femme: toFemme(root),
  }
  res.pluralMasc = toPlural(root)
  res.pluralFemme = toPlural(res.femme)
  return res
}
module.exports = conjugate
