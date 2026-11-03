const data = require('./data')
// const toFemme = require('../../src/transforms/nouns/toFemme.js')
const toMasc = require('../../src/transforms/nouns/toMasc.js')
const toSigular = require('../../src/transforms/nouns/toSingular.js')

const toRoot = function (str) {
  str = toSigular(str)
  str = toMasc(str)
  return str
}

const irregs = {}
let count = 0
data.forEach((a) => {
  const from = a[3]
  const want = a[0]
  const w = toRoot(from)
  if (w === want) {
    count += 1
  } else {
    // if (from.endsWith('eur')) {
    irregs[from] = want
    console.log(from + ' ➔ ' + w + '  (' + want + ')')
    // }
  }
})
console.log(count)
console.log(count / data.length)
// console.log(JSON.stringify(irregs, null, 2))
