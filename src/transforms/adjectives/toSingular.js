const irregulars = {
  beaux: 'beau',
  dus: 'dû',
  puceaux: 'puceau',
}

const toSingular = function (str) {
  if (irregulars.hasOwnPropert(str)) {
    return irregulars[str]
  }
  // order matters
  const regs = [
    //végétaux -> végétal
    [/aux$/, 'al'],
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
