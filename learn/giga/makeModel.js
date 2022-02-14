import pairs from './results/future-inf.js'
import {learn, compress, test} from 'suffix-thumb'

test(pairs)
const model=learn(pairs)
console.log(JSON.stringify(model, null, 2))

