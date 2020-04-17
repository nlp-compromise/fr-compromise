const sufixes = require('./suffixes')

const bySuffix = function (term, world) {
  const len = term.clean.length
  let max = 7
  if (len <= max) {
    max = len - 1
  }
  for (let i = max; i > 1; i -= 1) {
    let str = term.clean.substr(len - i, len)
    if (sufixes[str.length].hasOwnProperty(str) === true) {
      let tag = sufixes[str.length][str]
      term.tagSafe(tag, 'suffix -' + str, world)
      break
    }
  }
}

// byAricle:
//

// masculine “the” (le) and a feminine “the” (la).
// plural “the” (les) stays the same for groups of either gender.

// masculine “a” (un) and a feminine “a” (une).
//  plural form of

// Some: du (masculine) and de la (feminine)

const tagGender = function (terms, world) {
  for (let i = 0; i < terms.length; i += 1) {
    let term = terms[i]
    // assign gender to each Noun
    if (term.tags.Noun === true && !term.tags.MascNoun && !term.tags.FemmeNoun) {
      bySuffix(term, world)
    }
  }
}
module.exports = tagGender
