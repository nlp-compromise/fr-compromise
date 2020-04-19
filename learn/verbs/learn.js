let verbs = require('./verbs')

let pairs = []
Object.keys(verbs).forEach((inf) => {
  let want = verbs[inf]['Présent'][0]
  if (want) {
    pairs.push([inf, want])
  }
})

// order matters
const regs = [
  [/ébrer$/, 'èbre'],
  [/eter$/, 'ette'],
  [/er$/, 'e'],

  [/dre$/, 'ds'],
  [/ure$/, 'us'],
  [/ure$/, 'us'],
  [/tre$/, 's'],
  [/ire$/, 'is'],
  [/ore$/, 'os'],
  [/cre$/, 'cs'],

  [/llir$/, 'lle'],
  [/voir$/, 'vois'],
  [/tir$/, 's'],
  [/ir$/, 's'],
]

const toJe = function (str) {
  // try each replacement
  for (let i = 0; i < regs.length; i += 1) {
    let reg = regs[i][0]
    if (str.match(reg)) {
      str = str.replace(reg, regs[i][1])
      // for some reason, this seems to happen
      str = str.replace(/î/, 'i')
      return str
    }
  }
  // otherwise...
  str += 's'
  return str
}

let count = 0
pairs.forEach((a) => {
  let je = toJe(a[0])
  if (je === a[1]) {
    count += 1
  } else {
    if (a[0].endsWith('oir')) {
      console.log(`${a[0]}   ~${je}~    want:(${a[1]})`)
    }
  }
})

console.log(count / pairs.length)
