import prettyJSON from 'pretty-json-stringify'

import fs from 'fs'
// parse JSON-newline file
let arr = fs.readFileSync('./more-verbs.jsonl').toString()
  .split(/\n/).filter(str => str).map(str => JSON.parse(str))

let out = {}
arr.forEach(obj => {
  if (obj['Indicatif Futur'][0]) {
    let str = obj['Indicatif Futur']
    out[obj.word] = str
  }
})
console.log(prettyJSON(out, {
  shouldExpand: (_, level) => level >= 1 ? false : true
}))

import nlp from './src/index.js'
// console.log(nlp('dépister').verbs().conjugate())

