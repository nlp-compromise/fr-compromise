import { uncompress, reverse } from 'suffix-thumb'
import toFuture from './to-future.js'
import toPresent from './to-present.js'


const unPackAll = function (model) {
  return Object.keys(model).reduce((h, k) => {
    h[k] = uncompress(model[k])
    return h
  }, {})
}

const reverseAll = function (model) {
  return Object.keys(model).reduce((h, k) => {
    h[k] = reverse(model[k])
    return h
  }, {})
}

const models = {
  toPresent: unPackAll(toPresent),
  toFuture: unPackAll(toFuture),
}
models.fromPresent = reverseAll(models.toPresent)
models.fromFuture = reverseAll(models.toFuture)

export default models