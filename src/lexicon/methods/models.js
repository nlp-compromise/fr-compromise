import data from './_data.js'
import { uncompress, reverse } from 'suffix-thumb'

let models = {
  adjToF: uncompress(data.adjToF),
  adjToFp: uncompress(data.adjToFp),
  adjToMp: uncompress(data.adjToMp),
}
// add reversed forms
models.adjFromF = reverse(models.adjToF)
models.adjFromFp = reverse(models.adjToFp)
models.adjFromMp = reverse(models.adjToMp)

export default models