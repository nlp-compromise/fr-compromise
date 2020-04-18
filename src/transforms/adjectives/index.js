const toFemme = require('./toFemme')
const toPlural = require('./toPlural')

// conjugate a masculine-form adjective to all its other forms
const conjugate = function (str) {
  let res = {
    masc: str,
    femme: toFemme(str),
  }
  res.pluralMasc = toPlural(res.masc)
  res.pluralFemme = toPlural(res.femme)
  return res
}
module.exports = conjugate
