let masc = new Set([
  'le',
  'un',
  'du',
])
let femme = new Set([
  'la',
  'une',
])

const femaleEnds = ['anse', 'ette', 'esse', 'ance', 'eine', 'ure']
const maleEnds = ['age', 'isme', 'eau', 'ment', 'in', 'ou', 'et', 'ege', 'eme', 'ome', 'aume', 'age', 'isme', 'an', 'ent', 'ai', 'out', 'et', 'eu', 'ut', 'is', 'il', 'ex',
  // 't', 'x', 'd', 'l', 'f', 'm', 's',
]
const suffixGuess = function (term) {
  if (femaleEnds.find(suff => term.normal.endsWith(suff))) {
    return 'FemaleNoun'
  }
  if (maleEnds.find(suff => term.normal.endsWith(suff))) {
    return 'FemaleNoun'
  }
  return null
}

const fallback = function (term) {
  if (term.normal.endsWith('e')) {
    return 'FemaleNoun'
  }
  return 'MaleNoun' //-?
}

const lookLeft = function (terms, i) {
  for (let n = 1; n < 3; n += 1) {
    if (!terms[i - n]) {
      return null
    }
    let term = terms[i - n]
    if (masc.has(term.normal)) {
      return 'MaleNoun'
    }
    if (femme.has(term.normal)) {
      return 'FemaleNoun'
    }
  }
  return null
}

// guess a gender for each noun
const nounGender = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let { tags } = terms[i]
  if (tags.has('Noun') && !tags.has('MaleNoun') && !tags.has('FemaleNoun')) {
    let term = terms[i]
    // should these have genders?
    if (tags.has('ProperNoun')) {
      return null
    }
    // look for 'le', look for suffix
    let found = lookLeft(terms, i) || suffixGuess(terms[i]) || fallback(terms[i])
    if (found) {
      return setTag([term], found, world, false, '3-noun-gender')
    }
  }
  return null
}
export default nounGender