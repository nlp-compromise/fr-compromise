const hasApostrophe = /['‘’‛‵′`´]/

// normal regexes
const doRegs = function (str, regs) {
  for (let i = 0; i < regs.length; i += 1) {
    if (regs[i][0].test(str) === true) {
      return regs[i]
    }
  }
  return null
}

const checkRegex = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let { regexText, regexNormal, regexNumbers } = world.model.two
  let normal = term.machine || term.normal
  let text = term.text
  // keep dangling apostrophe?
  if (hasApostrophe.test(term.post) && !hasApostrophe.test(term.pre)) {
    text += term.post.trim()
  }
  let arr = doRegs(text, regexText) || doRegs(normal, regexNormal)
  // hide a bunch of number regexes behind this one
  if (!arr && /[0-9]/.test(normal)) {
    arr = doRegs(normal, regexNumbers)
  }
  if (arr) {
    setTag([term], arr[1], world, false, `2-regex- '${arr[2] || arr[0]}'`)
    term.confidence = 0.6
    return true
  }
  return null
}
export default checkRegex
