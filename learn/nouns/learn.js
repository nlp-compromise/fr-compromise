const data = require('./data')

// order matters
const regs = []
const toSingular = function (str) {
  // try each replacement
  for (let i = 0; i < regs.length; i += 1) {
    let reg = regs[i][0]
    if (str.match(reg)) {
      return str.replace(reg, regs[i][1])
    }
  }
  // otherwise...
  return str.replace(/s$/, '')
}

// const irregs = {}
let count = 0
data.forEach((a) => {
  let from = a[3]
  let want = a[1]
  let w = toSingular(from)
  if (w === want) {
    count += 1
  } else {
    // irregs[a[0]] = a[1]
    console.log(from + ' ➔ ' + w + '  (' + want + ')')
  }
})
console.log(count)
console.log(count / data.length)
