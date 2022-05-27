import { convert, uncompress, reverse } from 'suffix-thumb'
import model from '../_data.js'

const fromFemale = reverse(uncompress(model.adjective.female))
const fromPlural = reverse(uncompress(model.adjective.plural))
const fromFemalePlural = reverse(uncompress(model.adjective.femalePlural))

const toRoot = function (str, plural, gender) {
  if (plural && gender === 'f') {
    return convert(str, fromFemalePlural)
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

//   "actuel": ["actuelle", "actuels", "actuelles"],
// console.log(toRoot('actuelles', true, 'f'))
// console.log(toRoot('actuelle', false, 'f'))
// console.log(toRoot('actuels', true, 'm'))
// console.log(toRoot('actuel', false, 'm'))