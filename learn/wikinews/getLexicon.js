let lines = require('./parse')
lines = lines.slice(0, 300)

let tags = {}
lines.forEach((s) => {
  s.forEach((w) => {
    tags[w.tag] = tags[w.tag] || {}
    let word = w.word.toLowerCase()
    tags[w.tag][word] = tags[w.tag][word] || 0
    tags[w.tag][word] += 1
  })
})

// 'P+D': 241,
// ADJ: 719,
// ADV: 311,
// CC: 172,
// CLO: 32,
// CLR: 53,
// CLS: 88,
// CS: 90,
// DET: 1353,
// DETWH: 1,
// ET: 136,
// html: 1,
// NC: 1877,
// NPP: 493,
// P: 1242,
// PREF: 8,

// PRO: 43, //pronoun
// PROREL: 89,  //relative pronoun
// U: 100,

// V: 509,
// VINF: 140,
// VPP: 402,
// VPR: 61,
// VS: 10,

let lexicon = {
  adverbs: Object.keys(tags['ADV']),
  conjunctions: Object.keys(tags['CC']),
}
console.log(tags['V'])
