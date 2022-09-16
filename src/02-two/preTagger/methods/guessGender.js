let masc = new Set(['le', 'un', 'du'])
let femme = new Set(['la', 'une'])

const femaleEnds = ['anse', 'ette', 'esse', 'ance', 'eine', 'ure', 'ion']
const maleEnds = [
  'age', 'isme', 'eau', 'ment', 'in', 'ou', 'et', 'ege', 'eme', 'ome', 'aume', 'age', 'isme', 'an', 'ent', 'ai', 'out', 'et', 'eu', 'ut', 'is', 'il', 'ex',
  'an', 'and', 'ant', 'ent', 'in', 'int', 'om', 'ond', 'ont', 'eau', 'au', 'aud', 'aut', 'o', 'os', 'ot', 'ai', 'ais', 'ait', 'es', 'et', 'ou', 'out', 'out', 'oux', 'i', 'il', 'it', 'is', 'y', 'at', 'as', 'ois', 'oit', 'u', 'us', 'ut',
  'eu', 'er', 'cé', 'age', 'ege', 'ème', 'ome', 'aume', 'isme', 'as', 'is', 'os', 'us', 'ex', 'it', 'est', 'al', 'el', 'il', 'ol', 'eul', 'all', 'if', 'ef', 'ac', 'ic', 'oc', 'uc', 'am', 'um', 'en', 'air', 'er',
  'erf', 'ert', 'ar', 'arc', 'ars', 'art', 'our', 'ours', 'or', 'ord', 'ors', 'ort', 'ir', 'oir', 'eur', 'ail', 'eil', 'euil', 'ueil', 'ing',
]


const suffixGuess = function (term) {
  let str = term.normal
  str = str.replace(/s$/, '')
  if (femaleEnds.find(suff => str.endsWith(suff))) {
    return 'FemaleNoun'
  }
  if (maleEnds.find(suff => str.endsWith(suff))) {
    return 'MaleNoun'
  }
  return null
}

const fallback = function (term) {
  let str = term.normal
  if (str.endsWith('e') || str.endsWith('es')) {
    return 'FemaleNoun'
  }
  return null //-?
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

// look for a gendered adjective
const lookRight = function (terms, i) {
  for (let n = 1; n < 2; n += 1) {
    if (!terms[i + n]) {
      return null
    }
    let term = terms[i + n]
    if (term.tags.has('MaleAdjective')) {
      return 'MaleNoun'
    }
    if (term.tags.has('FemaleAdjective')) {
      return 'FemaleNoun'
    }
  }
  return null
}

const guessGender = function (terms, i) {
  let { tags } = terms[i]
  if (!tags.has('Noun')) {
    return null
  }
  if (tags.has('MaleNoun')) {
    return 'MaleNoun'
  }
  if (tags.has('FemaleNoun')) {
    return 'FemaleNoun'
  }
  let found = lookLeft(terms, i)
  found = found || lookRight(terms, i)
  found = found || suffixGuess(terms[i])
  found = found || fallback(terms[i])
  return found
}
export default guessGender