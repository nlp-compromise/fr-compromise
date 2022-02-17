// import { reverse } from 'suffix-thumb'

import adjToF from './adjective/adj-f.js'
import adjToFp from './adjective/adj-fp.js'
import adjToMp from './adjective/adj-mp.js'

import nounToPlural from './noun/to-plural.js'

import toPresent from './verb/to-future.js'
import toFuture from './verb/to-present.js'


// const adjFromF = reverse(adjToF)
// const adjFromFp = reverse(adjToFp)
// const adjFromMp = reverse(adjToMp)

export default {
  // adjective: 
  adjToF, adjToFp, adjToMp,
  // noun: 
  nounToPlural,
  // verb: 
  // toPresent, toFuture
}