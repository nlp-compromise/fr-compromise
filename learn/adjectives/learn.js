const data = require('./data')
// const suffixes = require('/Users/spencer/mountain/fr-compromise/src/tagger/data/suffixMap.js')

const toPlural = function (str) {
  // order matters
  const regs = [
    //structural ➔ structuraux
    [/al$/, 'aux'],
    // puceau ➔ puceaux
    [/eau$/, 'eaux'],
  ]
  // try each replacement
  for (let i = 0; i < regs.length; i += 1) {
    let reg = regs[i][0]
    if (str.match(reg)) {
      return str.replace(reg, regs[i][1])
    }
  }
  // otherwise...
  return str + 's'
}
const irregs = {}
let count = 0
data.forEach((a) => {
  // console.log(a[2])
  let plur = toPlural(a[0])
  if (a[2] === plur) {
    count += 1
  } else {
    irregs[a[0]] = a[1]
    // if (a[0].endsWith('t')) {
    console.log(a[0] + '   - ' + plur, a[2])
    // }
  }
})
console.log(count)
console.log(count / data.length)

console.log(irregs)
// console.log(toFem('virtuele'))
