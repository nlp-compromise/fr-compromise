const irregulars = {
  enquêtrices: 'enquêteuse',
}
// order matters
const regs = [
  // jouvenceaux ➔ jouvenceau
  [/eaux$/, 'eau'],
  //libéraux ➔ libéral
  [/aux$/, 'al'],
  // choux ➔ chou
  [/oux$/, 'ou'],
]

const toSingular = function (str) {
  // check irregular forms
  if (irregulars.hasOwnProperty(str)) {
    return irregulars[str]
  }
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
module.exports = toSingular
