const irregulars = {
  beaux: 'beau',
  dus: 'dû',
  puceaux: 'puceau',
}

const toSingular = function (str) {
  if (irregulars.hasOwnProperty(str)) {
    return irregulars[str]
  }
  // order matters
  const regs = [
    // tourangeaux ➔ tourangeau
    [/eaux$/, 'eau'],
    //végétaux -> végétal
    [/aux$/, 'al'],
    //enchanteresses ➔ enchanteresse
    [/esses$/, 'esse'],
  ]
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
