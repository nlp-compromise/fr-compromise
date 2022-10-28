import { convert, reverse } from 'suffix-thumb'
import model from '../model.js'

let pRev = reverse(model.noun.plural)
const toPlural = (str) => convert(str, model.noun.plural)
const fromPlural = (str) => convert(str, pRev)

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