import { convert, reverse } from 'suffix-thumb'
import model from '../model.js'

let pRev = reverse(model.noun.plural)
const toPlural = (str) => convert(str, model.noun.plural)
const fromPlural = (str) => convert(str, pRev)

export default {
  toPlural,
  fromPlural,
  all: toPlural
}