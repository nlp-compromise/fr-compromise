import noun from './noun/plurals.js'
import adjective from './adjective/index.js'

import futureTense from './verb/future-tense.js'
import imperfect from './verb/imperfect.js'
import pastParticiple from './verb/past-participle.js'
import presentTense from './verb/present-tense.js'

const vbOrder = ['je', 'tu', 'il', 'nous', 'vous', 'ils']
const nOrder = ['plural']
const adjOrder = ['female', 'plural', 'femalePlural']
const todo = {
  noun: { data: noun, keys: nOrder },
  adjective: { data: adjective, keys: adjOrder },
  futureTense: { data: futureTense, keys: vbOrder },
  imperfect: { data: imperfect, keys: vbOrder },
  pastParticiple: { data: pastParticiple, keys: ['prt'] },
  presentTense: { data: presentTense, keys: vbOrder },
}

// turn our conjugation data into word-pairs
let model = {}
Object.keys(todo).forEach(k => {
  model[k] = {}
  let { data, keys } = todo[k]
  keys.forEach((form, i) => {
    let pairs = []
    Object.keys(data).forEach(inf => {
      pairs.push([inf, data[inf][i]])
    })
    model[k][form] = pairs
    // console.log(k, form, pairs.length)
  })
})

export default model
