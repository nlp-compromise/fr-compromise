import data from './results/plural-sing.js'
import { learn, compress, test, validate } from 'suffix-thumb'

const pairs = validate(data)
test(pairs)
const model = learn(pairs)
console.log(JSON.stringify(model, null, 2))

