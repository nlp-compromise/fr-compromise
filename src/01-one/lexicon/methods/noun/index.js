import { convert, reverse } from 'suffix-thumb'
import model from '../model.js'

// gaps in the suffix-thumb model
const irregular = {
  monsieur: 'messieurs',
  madame: 'mesdames',
  mademoiselle: 'mesdemoiselles',
}
const irregularRev = Object.entries(irregular).reduce((h, [k, v]) => {
  h[v] = k
  return h
}, {})

// nouns already ending in s/x/z are invariable - 'le prix'/'les prix'
const invariable = /[sxz]$/

let pRev = reverse(model.noun.plural)
const toPlural = (str) => {
  if (irregular[str]) {
    return irregular[str]
  }
  if (invariable.test(str)) {
    return str
  }
  return convert(str, model.noun.plural)
}
const fromPlural = (str) => irregularRev[str] || convert(str, pRev)

const all = (str) => {
  let plr = toPlural(str)
  if (str === plr) {
    return [str]
  }
  return [str, plr]
}
export default {
  toPlural,
  fromPlural,
  all
}
