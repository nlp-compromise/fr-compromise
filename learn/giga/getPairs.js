import { forEachSync } from './_giga.js'
import doSentences from './french.js'
import fs from 'fs'

let ids = []
for (let i = 1; i <= 10; i += 1) {
  let str = String(i).padStart(4, '0')
  ids.push(str)
}
// ids = ['0004']

// ABR	abbreviation
// ADJ	adjective
// ADV	adverb

// VER:pres	verb present
// VER:simp	verb simple past
// VER:futu	verb futur
// VER:cond	verb conditional
// VER:impe	verb imperative
// VER:impf	verb imperfect
// VER:infi	verb infinitive
// VER:pper	verb past participle
// VER:ppre	verb present participle
// VER:subi	verb subjunctive imperfect
// VER:subp	verb subjunctive present

// "NOM": true,
let pairs = {}
const tag = 'NOM'
// const prev = 'les'

let results = {}
const doBoth = function (both) {
  let terms = both.fr
  terms.forEach((term, i) => {
    if (i === 0) {
      return
    }
    if (term['$'].pos === tag) {
      console.log(term)
      // let last = terms[i - 1]['$text'].toLowerCase()
      // if (last === prev) {
      //   let w = term['$text']
      //   let inf = term['$'].lem
      //   // console.log(last, w, inf)
      //   if (w && inf) {
      //     w = w.toLowerCase().trim()
      //     inf = inf.toLowerCase().trim()
      //     results[w] = inf
      //   }
      // }
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
results = Object.entries(results)
fs.writeFileSync('./pairs.js', 'export default ' + JSON.stringify(results))
