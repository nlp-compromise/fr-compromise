import data from './data.js'
import { learn, compress, test } from 'suffix-thumb'


const pairs = []
data.forEach(a => {
  let [m, f, mp, fp] = a
  pairs.push([m, f])
  // pairs.push(m)
})

let model = learn(pairs)
// model = compress(model)
console.log(JSON.stringify(model, null, 2))
// test(pairs)