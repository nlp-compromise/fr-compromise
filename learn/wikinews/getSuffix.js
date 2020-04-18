let lines = require('./parse')
// lines = lines.slice(0, 300)
const end = 5

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

let tags = {}
lines.forEach((s) => {
  s.forEach((w) => {
    let len = w.word.length
    if (len <= end) {
      return
    }
    let suffix = w.word.toLowerCase().substr(len - end, len)
    // suffix = suffix.replace(/[éèêë]/, 'e')
    // suffix = suffix.replace(/[ï]/, 'i')
    // suffix = suffix.replace(/[û]/, 'u')
    if (suffix.match(/[0-9]/)) {
      return
    }
    tags[suffix] = tags[suffix] || {}
    tags[suffix][w.tag] = tags[suffix][w.tag] || 0
    tags[suffix][w.tag] += 1
  })
})

let found = {}
const wantTag = 'N'
Object.keys(tags).forEach((k) => {
  let foundTags = Object.keys(tags[k])
  if (foundTags.length === 2 && tags[k][wantTag] > 5) {
    foundTags.forEach((tag) => {
      if (tags[k][tag] === 1) {
        delete tags[k][tag]
      }
    })
    foundTags = Object.keys(tags[k])
    // console.log(tags[k])
    //   console.log(foundTags)
  }
  if (foundTags.length === 1) {
    let count = tags[k][foundTags[0]]
    if (count > 1 && foundTags[0] === wantTag) {
      if (tags[k][wantTag] > 90) {
        // console.log(tags[k])
        found[k] = foundTags[0]
      }
      // console.log(k+':' foundTags[0], count)
    }
  }
})
console.log(found)
