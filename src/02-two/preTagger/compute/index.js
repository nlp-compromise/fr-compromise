// 1st pass
import checkRegex from './1st-pass/regex.js'
import titleCase from './1st-pass/titlecase.js'
import checkYear from './1st-pass/year.js'
// 2nd pass
import acronym from './2nd-pass/acronym.js'
import neighbours from './2nd-pass/neighbours.js'
import nounFallback from './2nd-pass/noun-fallback.js'
import suffixCheck from './2nd-pass/suffix-lookup.js'
// 3rd pass
import nounGender from './3rd-pass/noun-gender.js'
import nounPlurals from './3rd-pass/noun-plurals.js'
import adjPlurals from './3rd-pass/adj-plurals.js'
import fixContractions from './3rd-pass/fix-contractions.js'

// these methods don't care about word-neighbours
const firstPass = function (terms, world) {
  for (let i = 0; i < terms.length; i += 1) {
    //  is it titlecased?
    let found = titleCase(terms, i, world)
    // try look-like rules
    found = found || checkRegex(terms, i, world)
    // turn '1993' into a year
    checkYear(terms, i, world)
  }
}
const secondPass = function (terms, world) {
  for (let i = 0; i < terms.length; i += 1) {
    let found = acronym(terms, i, world)
    found = found || suffixCheck(terms, i, world)
    found = found || neighbours(terms, i, world)
    found = found || nounFallback(terms, i, world)
  }
}
const thirdPass = function (terms, world) {
  for (let i = 0; i < terms.length; i += 1) {
    nounGender(terms, i, world)
    nounPlurals(terms, i, world)
    adjPlurals(terms, i, world)
  }
  // (4th pass)
  for (let i = 0; i < terms.length; i += 1) {
    fixContractions(terms, i, world)
  }
}


const tagger = function (view) {
  let world = view.world
  view.docs.forEach(terms => {
    firstPass(terms, world)
    secondPass(terms, world)
    thirdPass(terms, world)
  })
  return view
}
export default tagger