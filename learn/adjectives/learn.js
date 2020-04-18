const data = require('./data')
// const suffixes = require('/Users/spencer/mountain/fr-compromise/src/tagger/data/suffixMap.js')

const toMasc = function (str) {
  // order matters
  const regs = [
    [/resse$/, 're'],
    [/auve$/, 'auf'],
    [/rice$/, 'eur'],
    [/anne$/, 'an'],
    [/otte$/, 'ot'],
    [/ille$/, 'il'],
    [/elle$/, 'el'],
    [/ette$/, 'et'],
    [/esse$/, 're'],
    [/enne$/, 'en'],
    [/onne$/, 'on'],
    [/ique$/, 'ic'],
    [/rque$/, 'rc'],
    [/que$/, 'c'],
    [/euse$/, 'eur'],
    [/euve$/, 'euf'],
    [/ouse$/, 'ou'],
    [/aïve$/, 'aif'],
    [/èche$/, 'èc'],
    [/ive$/, 'if'],
    [/ite$/, 'it'],
    [/ère$/, 'er'],
    [/che$/, 'c'],
    [/gue$/, 'g'],
    [/ète$/, 'et'],
    [/ève$/, 'ef'],
    [/guë$/, 'gu'],
    [/che$/, 'ch'],
  ]
  // try each replacement
  for (let i = 0; i < regs.length; i += 1) {
    let reg = regs[i][0]
    if (str.match(reg)) {
      return str.replace(reg, regs[i][1])
    }
  }
  // otherwise...
  return str.replace(/e$/, '')
}

const irregs = {}
let count = 0
data.forEach((a) => {
  let plur = toMasc(a[1])
  if (a[0] === plur) {
    count += 1
  } else {
    irregs[a[0]] = a[1]
    // if (a[0].endsWith('t')) {
    console.log(a[1] + '   - ' + plur, a[0])
    // }
  }
})
console.log(count)
console.log(count / data.length)

console.log(irregs)
// console.log(toFem('virtuele'))
