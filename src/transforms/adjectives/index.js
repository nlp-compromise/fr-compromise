const toMasc = require('./toMasc')
const toFemme = require('./toFemme')
const toPlural = require('./toPlural')
const toSingular = require('./toSingular')

// here, we consider singular/masculine
// to be like an 'infinitive' or default-form
const toRoot = function (str) {
  let root = toSingular(str)
  root = toMasc(root)
  root = toSingular(root)
  return root
}

// conjugate a masculine-form adjective to all its other forms
const conjugate = function (str) {
  let root = toRoot(str)

  let res = {
    masc: root,
    femme: toFemme(root),
  }
  res.pluralMasc = toPlural(root)
  res.pluralFemme = toPlural(res.femme)
  return res
}
module.exports = conjugate

// console.log(toRoot('tourangelles'))
