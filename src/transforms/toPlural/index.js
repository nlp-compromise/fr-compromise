const irregulars = {
  enquêteuse: 'enquêtrices',
}

// order matters
const regs = [
  //pastoureau ➔ pastoureaux
  [/eau$/, 'eaux'],
  // general -> generaux
  [/al$/, 'aux'],
]

const toPlural = function (str) {
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
  str += 's'
  return str
}
module.exports = toPlural
