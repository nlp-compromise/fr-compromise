import { convert, uncompress, reverse } from 'suffix-thumb'
import model from '../_data.js'

const fromPlural = reverse(uncompress(model.noun.plural))
const fromFemale = reverse(uncompress(model.noun.female))
// const fromFemalePlural = reverse(uncompress(model.noun.femalePlural))

const toRoot = function (str, plural, gender) {
  if (plural && gender === 'f') {
    // return convert(str, fromFemalePlural)
    str = convert(str, fromPlural)
    str = convert(str, fromFemale)
    return str
  }
  if (gender === 'f') {
    return convert(str, fromFemale)
  }
  if (plural) {
    return convert(str, fromPlural)
  }
  return str
}

export default toRoot
//   "ambassadeur": ["ambassadrice", "ambassadeurs", "ambassadrices"],
// console.log(toRoot('ambassadrices', true, 'f'))
// console.log(toRoot('ambassadrice', false, 'f'))
// console.log(toRoot('ambassadeurs', true, 'm'))
// console.log(toRoot('ambassadeur', false, 'm'))