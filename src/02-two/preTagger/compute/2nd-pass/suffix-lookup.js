
//sweep-through all suffixes
const suffixLoop = function (str = '', suffixes = []) {
  const len = str.length
  let max = 7
  if (len <= max) {
    max = len - 1
  }
  for (let i = max; i > 1; i -= 1) {
    let suffix = str.substr(len - i, len)
    if (suffixes[suffix.length].hasOwnProperty(suffix) === true) {
      // console.log(suffix)
      let tag = suffixes[suffix.length][suffix]
      return tag
    }
  }
  return null
}

// decide tag from the ending of the word
const suffixCheck = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let suffixes = world.model.two.suffixPatterns
  let term = terms[i]
  if (term.tags.size === 0) {
    let tag = suffixLoop(term.normal, suffixes)
    if (tag !== null) {
      setTag([term], tag, world, false, '2-suffix')
      term.confidence = 0.7
      return true
    }
    // try implicit form of word, too
    if (term.implicit) {
      tag = suffixLoop(term.implicit, suffixes)
      if (tag !== null) {
        setTag([term], tag, world, false, '2-implicit-suffix')
        term.confidence = 0.7
        return true
      }
    }
  }
  return null
}
export default suffixCheck
