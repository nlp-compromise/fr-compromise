import verbs from './data.js'
import scraped from '../scrape/result.js'

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

const getPairs = function (tense) {
  let byWord = {}
  Object.keys(verbs).forEach(inf => {
    let words = verbs[inf][tense] || []
    if (words.some(str => str === '' || str.length === 1)) {
      return
    }
    byWord[inf] = verbs[inf][tense]
  })
  return byWord
}



const res = getPairs("Imparfait")
Object.keys(scraped).forEach(inf => {
  if (res[inf]) {
    return
  }
  let vals = Object.values(scraped[inf]["Imperfect"])
  if (vals.length < 5 || vals.some(str => str === '' || str.length === 1 || str === 'le')) {
    return
  }
  res[inf] = vals
})

// let model = doModel("Présent", 'je')
// model = compress(model)
console.log(JSON.stringify(res, null, 2))
console.log(Object.keys(res).length)