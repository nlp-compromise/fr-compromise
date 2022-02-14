import { forEachSync } from './_giga.js'
import doSentences from './french.js'
import fs from 'fs'

let ids = []
for (let i = 1; i <= 10; i += 1) {
  let str = String(i).padStart(4, '0')
  ids.push(str)
}
// ids = ['0004']

let list = []
const tag = 'NOM'

const doBoth = function (both) {
  let terms = both.fr
  terms.forEach((term, i) => {
    if (i === 0) {
      return
    }
    if (term['$'].pos === tag) {
      let last = terms[i - 1]['$text'].toLowerCase()
      if (last === 'le' || last === 'un') {
        let w = term['$text']
        let inf = term['$'].lem
        // console.log(last, w, inf)
        if (w && inf) {
          w = w.toLowerCase().trim()
          inf = inf.toLowerCase().trim()
          list.push(inf)
        }
      }
    }
  })
}

await forEachSync(ids, async id => {
  try {
    console.log(`\ndoing ${id}:\n`)
    await doSentences(id, doBoth)
  } catch (e) {
    console.log(e)
  }
})
console.log('done')
fs.writeFileSync('./pairs.js', 'export default ' + JSON.stringify(list))
