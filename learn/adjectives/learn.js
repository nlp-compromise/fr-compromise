import data from './data.js'
// import data from '../nouns/data.js'

import { learn, compress, test } from 'suffix-thumb'


const pairs = {}
data.forEach(a => {
  let [m, f, mp, fp] = a
  pairs[m] = [f, mp, fp]
})

console.log(JSON.stringify(pairs, null, 2))
// let model = learn(pairs)
// model = compress(model)
// console.log(JSON.stringify(model, null, 2))
// test(pairs)