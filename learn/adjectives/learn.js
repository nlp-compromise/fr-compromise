const data = require('./data')
const toMasc = require('../../src/transforms/adjectives/toMasc.js')
const toSingular = require('../../src/transforms/adjectives/toSingular.js')

// const irregs = {}
let count = 0
data.forEach((a) => {
  let from = a[2]
  let root = toSingular(from)
  root = toMasc(root)
  root = toSingular(root)
  if (a[0] === root) {
    count += 1
  } else {
    // irregs[a[0]] = a[1]
    console.log(from + '   - ' + root + '  (' + a[0] + ')')
  }
})
console.log(count)
console.log(count / data.length)

// console.log(irregs)
// console.log(toFem('virtuele'))
