import verbs from './data.js'
import { learn, test, validate, compress } from 'suffix-thumb'
const hasPipe = /[\|\[]/

let index = {
  'je': 0, // "achète",
  'tu': 1, // "achètes",
  'il': 2, // "achète",
  'nous': 3, // "achetons",
  'vous': 4, // "achetez",
  'ils': 5, // "achètent"
}

const doModel = function (tense, form) {
  let pairs = []
  const i = index[form]
  Object.keys(verbs).forEach(inf => {
    let want = verbs[inf][tense][i]
    if (want && !hasPipe.test(want)) {
      pairs.push([inf, want])
    }
  })
  pairs = validate(pairs)
  // test(pairs)
  const model = learn(pairs)
  return model
}

let model = doModel("Futur Simple", 'ils')
model = compress(model)
console.log(JSON.stringify(model, null, 2))
