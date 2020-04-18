const irregs = {
  aéronaval: 'aéronavale',
  bancal: 'bancale',
  dû: 'due',
  fatal: 'fatale',
  morfal: 'morfale',
  natal: 'natale',
  naval: 'navale',
}
// order matters
const regs = [
  //structural ➔ structuraux
  [/al$/, 'aux'],
  // puceau ➔ puceaux
  [/eau$/, 'eaux'],
]

const toPlural = function (str) {
  // check irregular forms
  if (irregs.hasOwnProperty(str)) {
    return irregs[str]
  }
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
module.exports = toPlural
