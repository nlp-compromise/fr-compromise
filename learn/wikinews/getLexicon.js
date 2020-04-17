let lines = require('./parse')
// lines = lines.slice(0, 300)

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
// ET: 136,

// nouns:
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

const top = function (obj) {
  let keys = Object.keys(obj).sort((a, b) => {
    if (obj[a] > obj[b]) {
      return -1
    } else if (obj[a] < obj[b]) {
      return 1
    }
    return 0
  })
  let arr = keys.filter((k) => {
    return obj[k] > 1
  })
  return arr
}

console.log(JSON.stringify(top(tags['U']), null, 2))
